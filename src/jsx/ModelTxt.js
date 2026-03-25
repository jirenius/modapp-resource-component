import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelTxt from '../ModelTxt';
import { assertCallbackProp, assertNoChildren } from './helpers';

class ModelTxt extends BaseModelTxt {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (props.hasOwnProperty('as') && !props.hasOwnProperty('tagName')) {
			props.tagName = props.as;
		}
		delete props.as;

		assertNoChildren('ModelTxt', props);

		return new ModelTxt(props.model, assertCallbackProp('ModelTxt', props, 'update'), mapJsxProps(props, {
			omit: { model: true, text: true, update: true },
			ignore: { duration: true, tagName: true },
		}));
	}
}

export default ModelTxt;
