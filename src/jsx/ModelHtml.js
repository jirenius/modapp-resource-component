import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelHtml from '../ModelHtml';
import { assertCallbackProp, assertNoChildren } from './helpers';

class ModelHtml extends BaseModelHtml {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (props.hasOwnProperty('as') && !props.hasOwnProperty('tagName')) {
			props.tagName = props.as;
		}
		delete props.as;

		assertNoChildren('ModelHtml', props);

		return new ModelHtml(props.model, assertCallbackProp('ModelHtml', props, 'update'), mapJsxProps(props, {
			omit: { html: true, model: true, update: true },
			ignore: { tagName: true },
		}));
	}
}

export default ModelHtml;
