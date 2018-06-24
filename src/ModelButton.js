import { Button } from 'modapp-base-component';
import ModelListener from './utils/ModelListener';
import l10n from 'modapp-l10n';

/**
 * A button component based on an model
 */
class ModelButton extends Button {

	/**
	 * Creates an instance of ModelButton
	 * @param {object} [model] Optional model object
	 * @param {ModelComponent~updateCallback} update Callback function called on model change and when component is rendered. If a string is returned, it will set the text of the button.
	 * @param {function} click Click callback. Will pass itself and the event as argument on callback.
	 * @param {object} [opt] Optional parameters for the underlying modapp-base-component/Button.
	 */
	constructor(model, update, click, opt) {
		if (typeof model === 'function') {
			opt = update;
			update = model;
			model = null;
		}

		super(null, click, opt);

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

export default ModelButton;
