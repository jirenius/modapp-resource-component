import BaseModelFragment from '../ModelFragment';
import {
	assertOptionalFunctionProp,
	getOptionalProps,
	getSingleRenderPropChild,
	hasOwn,
	normalizeFactoryResult,
} from './helpers';

class ModelFragment extends BaseModelFragment {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (hasOwn(props, 'factory')) {
			throw new Error("ModelFragment JSX uses a render-prop child instead of factory.");
		}

		let factory = getSingleRenderPropChild('ModelFragment', props);
		let opt = getOptionalProps(props, [ 'onAdd', 'onRemove' ]);

		assertOptionalFunctionProp('ModelFragment', props, 'onAdd');
		assertOptionalFunctionProp('ModelFragment', props, 'onRemove');

		return new ModelFragment(props.model, function(key, value) {
			return normalizeFactoryResult('ModelFragment', factory(key, value));
		}, opt);
	}
}

export default ModelFragment;
