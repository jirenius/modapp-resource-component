import BaseCollectionComponent from '../CollectionComponent';
import { assertCallbackProp, getOptionalProps, getSingleJsxComponent, hasOwn } from './helpers';

class CollectionComponent extends BaseCollectionComponent {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (hasOwn(props, 'component')) {
			throw new Error("CollectionComponent JSX uses a single child instead of component.");
		}

		return new CollectionComponent(
			props.collection,
			getSingleJsxComponent('CollectionComponent', props),
			assertCallbackProp('CollectionComponent', props, 'update'),
			getOptionalProps(props, [ 'postrenderUpdate' ])
		);
	}
}

export default CollectionComponent;
