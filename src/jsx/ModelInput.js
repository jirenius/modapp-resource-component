import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelInput from '../ModelInput';
import { assertCallbackProp, assertNoChildren } from './helpers';

class ModelInput extends BaseModelInput {

	static fromJSX(props) {
		props = Object.assign({}, props);

		assertNoChildren('ModelInput', props);

		return new ModelInput(props.model, assertCallbackProp('ModelInput', props, 'update'), mapJsxProps(props, {
			omit: { model: true, update: true, value: true },
		}));
	}
}

export default ModelInput;
