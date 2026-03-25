import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseCollectionSelect from '../CollectionSelect';
import { assertNoChildren, assertOptionalFunctionProp, normalizeFactoryResult } from './helpers';

class CollectionSelect extends BaseCollectionSelect {

	static fromJSX(props) {
		props = Object.assign({}, props);

		assertNoChildren('CollectionSelect', props);

		let optionMap = assertOptionalFunctionProp('CollectionSelect', props, 'optionMap');
		let optionFactory = assertOptionalFunctionProp('CollectionSelect', props, 'optionFactory');
		let opt = mapJsxProps(props, {
			omit: { collection: true, optionMap: true },
			ignore: { optionFactory: true, placeholder: true, selected: true },
		});

		if (optionFactory) {
			opt.optionFactory = function(option) {
				return normalizeFactoryResult('CollectionSelect', optionFactory(option));
			};
		}

		return new CollectionSelect(props.collection, optionMap, opt);
	}
}

export default CollectionSelect;
