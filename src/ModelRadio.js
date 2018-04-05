import Radio from 'modapp-base-component/Radio';
import ModelListener from './utils/ModelListener';

/**
 * A radio component based on an model
 */
class ModelRadio extends Radio {

	/**
	 * Creates an instance of ModelRadio
	 * @param {object} [model] Optional model object
	 * @param {ModelComponent~updateCallback} update Callback function called on model change and when component is rendered. If a boolean is returned, it will be used to check/uncheck the radiobutton.
	 * @param {object} [opt] Optional parameters for the underlying modapp-base-component/Radiobutton.
	 */
	constructor(model, update, opt) {
		if (typeof model === 'function') {
			opt = update;
			update = model;
			model = null;
		}

		super(null, opt);

		this.update = update;
		this.ml = new ModelListener(model, this, this._changeHandler.bind(this));
	}

	render(el) {
		this.ml.onRender();
		return super.render(el);
	}

	unrender() {
		super.unrender();
		this.ml.onUnrender();
	}

	setModel(model) {
		this.ml.setModel(model);
		return this;
	}

	_changeHandler(m, c, changed) {
		let result = this.update(m, c, changed);
		if (typeof result === 'boolean') {
			this.setChecked(result);
		}
	}
}

export { generateName } from 'modapp-base-component/Radio';
export default ModelRadio;
