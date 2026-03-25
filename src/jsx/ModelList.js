import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelList from '../ModelList';
import { getSingleRenderPropChild, hasOwn, normalizeFactoryResult } from './helpers';

class ModelList extends BaseModelList {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (props.hasOwnProperty('as') && !props.hasOwnProperty('tagName')) {
			props.tagName = props.as;
		}
		delete props.as;

		if (hasOwn(props, 'componentFactory')) {
			throw new Error("ModelList JSX uses a render-prop child instead of componentFactory.");
		}

		let factory = getSingleRenderPropChild('ModelList', props);

		return new ModelList(props.model, function(key, value) {
			return normalizeFactoryResult('ModelList', factory(key, value));
		}, mapJsxProps(props, {
			omit: { model: true },
			ignore: {
				exclude: true,
				include: true,
				subClassName: true,
				subTagName: true,
				tagName: true,
			},
		}));
	}
}

export default ModelList;
