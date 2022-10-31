import { anim } from 'modapp-utils';
import { RootElem } from 'modapp-base-component';

/**
 * A component rendering a list of key/value pairs based on a model
 */
class ModelList extends RootElem {

	/**
	 * Creates an instance of ModelList
	 * @param {object} model object
	 * @param {function} componentFactory  A factory function taking (key, value) as argument, returning a component.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.tagName] Tag name (eg. 'ul') for the element. Defaults to 'div'.
	 * @param {string} [opt.className] Class name
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 * @param {string[]} [opt.exclude] Arrays of keys to exclude
	 * @param {string[]} [opt.include] Arrays of keys to include. If present, also determines order
	 * @param {string} [opt.subTagName] Tag name (eg. 'li') for the element. Defaults to 'div'.
	 * @param {string} [opt.subClassName] A factory function taking a collection item as argument, returning the className for the component.
	 */
	constructor(model, componentFactory, opt) {
		opt = Object.assign({ tagName: 'div' }, opt);

		super(opt.tagName, opt);

		this.collection = null;
		this.componentFactory = componentFactory;
		this.subTagName = opt.subTagName || 'div';
		this.subClassName = opt.subClassName || null;
		this.exclude = opt.exclude || null;
		this.include = opt.include || null;

		this.components = null;
		this.removedComponents = [];

		this._change = this._change.bind(this);

		this._rel = null; // Root elements node

		this.setModel(model);
	}

	/**
	 * Sets the model.
	 * If the component is rendered, the list will be rerendered with
	 * the new model, without any animation.
	 * @param {?object} model map of items
	 * @returns {this}
	 */
	setModel(model) {
		model = model || null;

		if (model === this.model) {
			return this;
		}

		if (!this._rel) {
			this.model = model;
			return this;
		}

		this._unrenderComponents();
		this.model = model;
		this._renderComponents();
		this._checkSync();
		return this;
	}

	/**
	 * Gets the current model
	 * @returns {?object}
	 */
	getModel() {
		return this.model;
	}

	/**
	 * Get the component for a model by index
	 * @param {number} idx Index if model
	 * @returns {?Component} Model component, or null if the list isn't rendered, or if index is out of bounds
	 */
	getComponent(idx) {
		if (!this._rel) {
			return null;
		}

		let cont = this.components[idx];
		return cont ? cont.component : null;
	}

	/**
	 * Waits for the synchronization of the collection and component list to
	 * ensure the collection models matches the rendered components.
	 * Calling this method is necessary when calling getComponent after
	 * adding/removing items from the collections.
	 * Callback will never be called if the CollectionList isn't rendered, or
	 * if it unrenders before it has been synchronized.
	 * @param {function} callback Callback function called when collection and component list is synchronized.
	 */
	sync(callback) {
		if (!this._rel) {
			return;
		}

		if (this._syncCallbacks) {
			this._syncCallbacks.push(callback);
		} else {
			this._syncCallbacks = [ callback ];
		}

		this._checkSync();
	}

	render(el) {
		this._rel = super.render(el);
		this._renderComponents();
		return this._rel;
	}

	unrender() {
		this._unrenderComponents();
		this._syncCallbacks = null;
		super.unrender();
		this._rel = null;
	}

	// produces an array of strings corresponding to the keys of the contained model. The array
	// is sorted and adjusted according to the include and exclude options.
	// @returns {string[]}
	_orderedKeys() {
		const props = this.model.props;
		let keys;
		const ic = this.include;
		if (ic === null) {
			keys = Reflect.ownKeys(props);
			keys.sort();
		} else {
			keys = [];
			for (let i = 0; i < ic.length; i++) {
				const key = ic[i];
				if (props.hasOwnProperty(key)) {
					keys.push(key);
				}
			}
		}

		const ex = this.exclude;
		if (ex !== null) {
			keys = keys.filter(function (key) {
				return ex.indexOf(key) > -1;
			});
		}
		return keys;
	}

	_checkSync() {
		// No use checking syncronization if noone cares.
		if (!this._syncCallbacks) {
			return;
		}

		const keys = this._orderedKeys();
		if (keys.length !== this.components.length) {
			return;
		}

		const props = this.model.props;
		for (let i = 0; i < keys.length; i++) {
			const comp = this.components[i];
			if (props[keys[i]] !== comp.model) {
				return;
			}
		}

		// We are in sync
		for (let cb of this._syncCallbacks) {
			cb();
		}
		this._syncCallbacks = null;
	}

	_setSubClassName(item, li) {
		if (this.subClassName) {
			const className = this.subClassName(item);
			if (className) {
				li.className = className;
			}
		}
	}

	_renderComponents() {
		if (!this.model) {
			return;
		}

		this.components = [];
		const props = this.model.props;
		const keys = this._orderedKeys();
		for (let idx = 0; idx < keys.length; idx++) {
			const key = keys[idx];
			const item = props[key];
			let component = this.componentFactory(key, item);
			let li = document.createElement(this.subTagName);
			this.components.push({ item, component, li, idx, key });
			this._setSubClassName(item, li);

			this._rel.appendChild(li);
			if (component) {
				component.render(li);
			}
		}

		this._setEventListener(true);
	}

	_unrenderComponents() {
		if (!this.model) {
			return;
		}

		for (let cont of this.components) {
			this._removeComponent(cont);
		}
		this.components = null;

		for (let cont of this.removedComponents) {
			this._removeComponent(cont);
		}
		this.removedComponents = [];

		this._setEventListener(false);
	}

	// Callback when the model have a change event
	_change(e) {
		// Assert component wasn't unrendered by another event handler
		if (!this._rel) {
			return;
		}

		const props = this.model.props;

		// for each key listed in the event, check what actually changed.
		for (let key in e) {
			// find component that corresponds to the key, if any.
			let cont = null;
			for (let ct of this.components) {
				if (ct.key === key) {
					cont = ct;
					break;
				}
			}

			const item = props[key];
			let idx = -1;
			if (cont !== null) {
				if (item === undefined) {
					// item was removed
					this._remove(cont.idx);
					continue;
				}
				idx = cont.idx;
			} else {
				// find index of new property in model
				const keys = this._orderedKeys();
				for (let pi = 0; pi < keys.length; pi++) {
					if (keys[pi] === key) {
						idx = pi;
						break;
					}
				}
				if (idx < 0) {
					// not found? This should normally not happen since a remove would
					// have resulted in the removal of an existing component. In any case,
					// there's nothing to add.
					continue;
				}
			}

			let li;
			let component = this.componentFactory(key, item);
			if (cont === null) {
				// add new component
				li = document.createElement(this.subTagName);
				cont = { model: item, component, li, idx, key };
				this.components.splice(idx, 0, cont);
				this._setSubClassName(item, li);

				li.style.display = 'none';
				// Append last?
				if (this.components.length - 1 === idx) {
					this._rel.appendChild(li);
				} else {
					this._rel.insertBefore(li, this.components[idx + 1].li);
				}
				component.render(li);
				cont.token = anim.slideVertical(li, true, { reset: true });
			} else {
				// replace component
				cont.component.unrender();
				cont.component = component;
				this.components[idx] = cont;
				component.render(cont.li);
			}
		}
		this._checkSync();
	}


	// called when the model entries are removed
	_remove(idx) {
		const cont = this.components[idx];
		this.components.splice(idx, 1);
		this.removedComponents.push(cont);

		anim.stop(cont.token);
		cont.token = anim.slideVertical(cont.li, false, {
			callback: () => {
				let idx = this.removedComponents.indexOf(cont);
				if (idx >= 0) {
					this.removedComponents.splice(idx, 1);
					this._removeComponent(cont);
				}
			}
		});

		this._checkSync();
	}

	_removeComponent(cont) {
		if (!this._rel) {
			return;
		}

		let { token, component } = cont;
		anim.stop(token);
		if (component) {
			component.unrender();
		}

		this._rel.removeChild(cont.li);
	}

	_setEventListener(on) {
		if (this.model && this.model.on) {
			if (on) {
				this.model.on('change', this._change);
			} else {
				this.model.off('change', this._change);
			}
		}
	}
}

export default ModelList;
