/**
 * Update callback function
 * @callback ModelListener~updateCallback
 * @param {Model} model Model
 * @param {Component} component Component received in ModelListener constructor.
 * @param {?object} changed Model's change event parameters. Null if the callback is triggered by render or setModel.
 */

/**
 * A helper class for model components
 */
class ModelListener {

	/**
	 * Creates a new ModelListener instance
	 * @param {Model} [model] Optional model object
	 * @param {Component} component Component
	 * @param {ModelListener~updateCallback} update Callback function called on model change and when component is rendered
	 */
	constructor(model, component, update) {
		this.model = model;
		this.component = component;
		this.update = update;
		this.rendered = false;

		this._onModelChange = this._onModelChange.bind(this);
	}

	onRender() {
		this._setEventListener(true);
		this._onModelChange(null);
		this.rendered = true;
	}

	onUnrender() {
		this._setEventListener(false);
		this.rendered = false;
	}

	/**
	 * Set model
	 * If component is rendered, update will be triggered.
	 * @param {?Model} model Model
	 * @returns {this}
	 */
	setModel(model) {
		model = model || null;
		if (model === this.model) {
			return;
		}

		if (this.rendered) {
			this._setEventListener(false);
			this.model = model;
			this._setEventListener(true);
			this._onModelChange(null);
		} else {
			this.model = model;
		}

		return this;
	}

	_setEventListener(on) {
		if (!this.model || !this.model.on || !this.update) {
			return;
		}

		if (on) {
			this.model.on('change', this._onModelChange);
		} else {
			this.model.off('change', this._onModelChange);
		}
	}

	_onModelChange(changed) {
		if (this.update) {
			this.update(this.model, this.component, changed);
		}
	}
}

export default ModelListener;
