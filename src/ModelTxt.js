import { Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ModelListener from './utils/ModelListener';

/**
 * A text component based on an model
 */
class ModelTxt extends Txt {

	/**
	 * Creates an instance of ModelTxt
	 * @param {object} [model] Optional model object
	 * @param {ModelComponent~updateCallback} update Callback function called on model change and when component is rendered. If a string is returned, it will set the text of the element.
	 * @param {object} [opt] Optional parameters for the underlying modapp-base-component/Txt.
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
		if (typeof result === 'string' || l10n.isLocaleString(result)) {
			this.setText(result);
		}
	}
}

export default ModelTxt;
