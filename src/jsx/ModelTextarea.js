import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelTextarea from '../ModelTextarea';
import { assertCallbackProp, assertNoChildren } from './helpers';

class ModelTextarea extends BaseModelTextarea {

	static fromJSX(props) {
		props = Object.assign({}, props);

		assertNoChildren('ModelTextarea', props);

		return new ModelTextarea(props.model, assertCallbackProp('ModelTextarea', props, 'update'), mapJsxProps(props, {
			omit: { model: true, update: true, value: true },
		}));
	}
}

export default ModelTextarea;
