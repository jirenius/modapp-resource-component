import ModelCheckbox from 'modapp-base-component/ModelCheckbox';

/**
 * A radiobutton component based on an model
 */
class ModelRadiobutton extends ModelCheckbox {

	/**
	 * Creates an instance of ModelRadiobutton
	 * @param {object} [model] Optional model object
	 * @param {ModelComponent~updateCallback} update Callback function called on model change and when component is rendered. If a boolean is returned, it will be used to check/uncheck the radiobutton.
	 * @param {object} [opt] Optional parameters for the underlying modapp-base-component/Radiobutton.
	 */
	constructor(model, update, opt) {
		super(model, update, opt);
	}
}

export default ModelRadiobutton;