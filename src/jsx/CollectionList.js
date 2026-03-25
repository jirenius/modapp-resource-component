import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseCollectionList from '../CollectionList';
import { getSingleRenderPropChild, hasOwn, normalizeFactoryResult } from './helpers';

class CollectionList extends BaseCollectionList {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (props.hasOwnProperty('as') && !props.hasOwnProperty('tagName')) {
			props.tagName = props.as;
		}
		delete props.as;

		if (hasOwn(props, 'componentFactory')) {
			throw new Error("CollectionList JSX uses a render-prop child instead of componentFactory.");
		}

		let factory = getSingleRenderPropChild('CollectionList', props);

		return new CollectionList(props.collection, function(item, idx) {
			return normalizeFactoryResult('CollectionList', factory(item, idx));
		}, mapJsxProps(props, {
			omit: { collection: true },
			ignore: {
				duration: true,
				horizontal: true,
				subClassName: true,
				subTagName: true,
				tagName: true,
			},
		}));
	}
}

export default CollectionList;
