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
	 */
	constructor(model, component, update) {
		if (typeof component === 'function') {
			update = component;
			component = model;
			model = null;
		}

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

	render(el) {
		this.ml.onRender();
		return this.ml.component.render(el);
	}

	unrender() {
		this.ml.component.unrender();
		this.ml.onUnrender();
	}
}

export default ModelComponent;
