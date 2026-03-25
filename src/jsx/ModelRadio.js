import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelRadio from '../ModelRadio';
import { assertCallbackProp, assertNoChildren } from './helpers';

class ModelRadio extends BaseModelRadio {

	static fromJSX(props) {
		props = Object.assign({}, props);

		assertNoChildren('ModelRadio', props);

		return new ModelRadio(props.model, assertCallbackProp('ModelRadio', props, 'update'), mapJsxProps(props, {
			omit: { checked: true, model: true, update: true },
		}));
	}
}

export default ModelRadio;
