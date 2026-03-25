import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelCheckbox from '../ModelCheckbox';
import { assertCallbackProp, assertNoChildren } from './helpers';

class ModelCheckbox extends BaseModelCheckbox {

	static fromJSX(props) {
		props = Object.assign({}, props);

		assertNoChildren('ModelCheckbox', props);

		return new ModelCheckbox(props.model, assertCallbackProp('ModelCheckbox', props, 'update'), mapJsxProps(props, {
			omit: { checked: true, model: true, update: true },
		}));
	}
}

export default ModelCheckbox;
