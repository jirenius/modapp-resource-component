import ModelListener from './utils/ModelListener';


/**
 * A generic component wrapper that creates components for each key/value pair on a model.
 */
class ModelFragment {

	/**
	 * Creates a new ModelFragment instance
	 * @param {Model} [model] Optional model object
	 * @param {function} factory Component factory with the signature: (key, value) => Component
	 * @param {object} [opt] Optional parameters
	 * @param {function} [opt.onAdd] Callback called to render the component on add. Can be used for animation. Defaults to (c, el) => c.render(el)
	 * @param {function} [opt.onRemove] Callback called to eventually unrender the component on remove. Defaults to (c, unrender) => unrender()
	 */
	constructor(model, factory, opt) {
		if (typeof model === 'function') {
			opt = factory;
			factory = model;
			model = null;
		}

		this.opt = opt || {};
		this._factory = factory;
		this._comps = null;
		this._unrendering = null;
		this._unrender = {};
		this._el = null;
		this.ml = new ModelListener(model, this, this._update.bind(this));
	}

	/**
	 * Set model.
	 * @param {?Model} model Model
	 * @returns {this}
	 */
	setModel(model) {
		this.ml.setModel(model);
		return this;
	}

	/**
	 * Returns the model.
	 * @returns {?Model} Model
	 */
	getModel() {
		return this.ml.model;
	}

	render(el) {
		this._comps = {};
		this._unrendering = {};
		this._el = el;
		this.ml.onRender();
	}

	unrender() {
		if (this._el) {
			for (let k in this._unrendering) {
				let cont = this._unrendering[k];
				if (cont.c) {
					cont.c.unrender();
				}
			}
			for (let k in this._comps) {
				let cont = this._comps[k];
				if (cont.c) {
					cont.c.unrender();
				}
			}
			this.ml.onUnrender();
		}
		this._unrendering = null;
		this._comps = null;
		this._el = null;
	}

	_update(m) {
		if (!this._el) return;

		let p = m && typeof m === 'object' && typeof m.props == 'object'
			? m.props
			: m;
		let onAdd = (this.ml.rendered && this.opt.onAdd) || ((c, el) => c.render(el));
		let onRemove = (this.ml.rendered && this.opt.onRemove) || ((c, unrender) => unrender());

		// Render components
		if (p) {
			for (let k in p) {
				if (!p.hasOwnProperty(k)) {
					continue;
				}
				let v = p[k];
				let cont = this._comps[k];

				// Unrender previous component on value change
				if (cont && cont.v !== v) {
					if (cont.c) {
						let oldCont = cont;
						this._unrendering[k] = oldCont;
						let promise = onRemove(oldCont.c, () => this._unrenderCont(k, oldCont));
						// Legacy support for promises.
						if (promise && typeof promise.then == 'function') {
							promise.then(() => this._unrendered(k, oldCont));
						}
					}
					cont = null;
				}

				if (!cont) {
					let c = this._factory(k, v);
					if (c) {
						onAdd(c, this._el);
					}
					cont = { v, c };
					this._comps[k] = cont;
				}
			}
		}

		// Unrender components
		for (let k in this._comps) {
			if (p && p.hasOwnProperty(k)) {
				continue;
			}
			let cont = this._comps[k];
			if (cont.c) {
				this._unrendering[k] = cont;
				let promise = onRemove(cont.c, () => this._unrenderCont(k, cont));
				// Legacy support for promises.
				if (promise && typeof promise.then == 'function') {
					promise.then(() => this._unrendered(k, cont));
				}
			}
			delete this._comps[k];
		}
	}

	_unrenderCont(k, cont) {
		if (this._unrendering && this._unrendering[k] == cont) {
			if (cont.c) {
				cont.c.unrender();
			}
			delete this._unrendering[k];
		}
	}

	// Legacy support for promises.
	_unrendered(k, cont) {
		if (this._unrendering && this._unrendering[k] == cont) {
			delete this._unrendering[k];
		}
	}
}

export default ModelFragment;
