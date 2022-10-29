import ModelListener from './utils/ModelListener';

/**
 * Update callback function
 * @callback ModelComponent~updateCallback
 * @param {Model} model Model
 * @param {Component} component Component
 * @param {?object} changed Model's change event parameters. Null if the callback is triggered by render or setModel.
 */

/**
 * A generic component wrapper that listens to change events on a model, calling update on change.
 */
class ModelComponent {

	/**
	 * Creates a new ModelComponent instance
	 * @param {Model} [model] Optional model object
	 * @param {Component} component Component
	 * @param {ModelComponent~updateCallback} update Callback function called on model change and when component is rendered
	 * @param {object} [opt] Optional parameters
	 * @param {string} [opt.postrenderUpdate] Flag setting if call to update should be done after render. Defaults to false.
	 */
	constructor(model, component, update, opt) {
		if (typeof component === 'function') {
			update = component;
			component = model;
			model = null;
		}
		this.postrender = !!(opt && opt.postrenderUpdate);

		this.ml = new ModelListener(model, component, update);
	}

	/**
	 * Set model
	 * If component is rendered, update will be triggered.
	 * @param {?Model} model Model
	 * @returns {this}
	 */
	setModel(model) {
		this.ml.setModel(model);
		return this;
	}

	/**
	 * Get model.
	 * @returns {?Model} Current set model.
	 */
	getModel() {
		return this.ml.getModel();
	}

	/**
	 * Returns the wrapped component
	 * @returns {Component} Wrapped component
	 */
	getComponent() {
		return this.ml.component;
	}

	render(el) {
		if (!this.postrender) this.ml.onRender();
		let rel = this.ml.component.render(el);
		if (this.postrender) this.ml.onRender();
		return rel;
	}

	unrender() {
		this.ml.component.unrender();
		this.ml.onUnrender();
	}
}

export default ModelComponent;
