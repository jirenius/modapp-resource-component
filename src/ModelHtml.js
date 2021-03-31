import { Html } from 'modapp-base-component';
import ModelListener from './utils/ModelListener';

/**
 * A html component based on an model.
 */
class ModelHtml extends Html {

	/**
	 * Creates an instance of ModelHtml
	 * @param {object} [model] Optional model object
	 * @param {ModelComponent~updateCallback} update Callback function called on model change and when component is rendered. If a string is returned, it will set the text of the element.
	 * @param {object} [opt] Optional parameters for the underlying modapp-base-component/Html.
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
		this.setHtml(this.update(m, c, changed));
	}
}

export default ModelHtml;
