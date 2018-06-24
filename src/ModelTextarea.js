import { Textarea } from 'modapp-base-component';
import ModelListener from './utils/ModelListener';

/**
 * A textarea component based on an model
 */
class ModelTextarea extends Textarea {

	/**
	 * Creates an instance of ModelTextarea
	 * @param {object} [model] Optional model object
	 * @param {ModelComponent~updateCallback} update Callback function called on model change and when component is rendered. If a string is returned, it will be used as the value of the textarea.
	 * @param {object} [opt] Optional parameters for the underlying modapp-base-component/Textarea.
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
		if (typeof result === 'string') {
			this.setValue(result);
		}
	}
}

export default ModelTextarea;
