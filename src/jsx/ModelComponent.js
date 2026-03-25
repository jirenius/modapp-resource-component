import BaseModelComponent from '../ModelComponent';
import { assertCallbackProp, getOptionalProps, getSingleJsxComponent, hasOwn } from './helpers';

class ModelComponent extends BaseModelComponent {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (hasOwn(props, 'component')) {
			throw new Error("ModelComponent JSX uses a single child instead of component.");
		}

		return new ModelComponent(
			props.model,
			getSingleJsxComponent('ModelComponent', props),
			assertCallbackProp('ModelComponent', props, 'update'),
			getOptionalProps(props, [ 'postrenderUpdate' ])
		);
	}
}

export default ModelComponent;
