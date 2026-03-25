import { mapJsxProps } from 'modapp-base-component/jsx';
import BaseModelButton from '../ModelButton';
import { assertCallbackProp, assertNoChildren, hasOwn } from './helpers';

class ModelButton extends BaseModelButton {

	static fromJSX(props) {
		props = Object.assign({}, props);

		if (props.hasOwnProperty('as') && !props.hasOwnProperty('tagName')) {
			props.tagName = props.as;
		}
		delete props.as;

		assertNoChildren('ModelButton', props);

		let click = props.onClick;
		if (typeof click !== 'undefined' && click !== null && typeof click !== 'function') {
			throw new Error("ModelButton JSX onClick must be a function.");
		}

		let opt = mapJsxProps(props, {
			omit: { model: true, onClick: true, text: true, update: true },
			ignore: { tagName: true },
		});

		if (opt.events && hasOwn(opt.events, 'click')) {
			if (!click) {
				click = opt.events.click;
			}

			delete opt.events.click;
			if (!Object.keys(opt.events).length) {
				delete opt.events;
			}
		}

		return new ModelButton(props.model, assertCallbackProp('ModelButton', props, 'update'), click, opt);
	}
}

export default ModelButton;
