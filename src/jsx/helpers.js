import { Elem } from 'modapp-base-component/jsx';

function hasOwn(obj, key) {
	return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

function isElemNode(value) {
	return !!value &&
		typeof value === 'object' &&
		(typeof value.type === 'string' ||
			hasOwn(value, 'tagName') ||
			hasOwn(value, 'text') ||
			hasOwn(value, 'html') ||
			hasOwn(value, 'component'));
}

function isRenderableComponent(value) {
	return !!value &&
		typeof value === 'object' &&
		typeof value.render === 'function';
}

function pushJsxChild(list, child) {
	if (child === null || typeof child === 'undefined' || typeof child === 'boolean') {
		return;
	}

	if (Array.isArray(child)) {
		for (let i = 0; i < child.length; i++) {
			pushJsxChild(list, child[i]);
		}
		return;
	}

	if (typeof child === 'string' || typeof child === 'number') {
		list.push({ text: String(child) });
		return;
	}

	if (typeof child === 'function' || isElemNode(child)) {
		list.push(child);
		return;
	}

	if (isRenderableComponent(child)) {
		list.push({ component: child });
		return;
	}

	throw new Error("Unsupported JSX child type.");
}

function normalizeJsxChildren(children) {
	let list = [];
	pushJsxChild(list, children);
	return list;
}

function assertNoChildren(name, props) {
	if (hasOwn(props, 'children')) {
		throw new Error(name + " JSX does not support children.");
	}
}

function assertCallbackProp(name, props, key) {
	let callback = props && props[key];
	if (typeof callback !== 'function') {
		throw new Error(name + " JSX requires a " + key + " callback.");
	}
	return callback;
}

function assertOptionalFunctionProp(name, props, key) {
	if (!hasOwn(props, key) || typeof props[key] === 'undefined') {
		return undefined;
	}

	if (typeof props[key] !== 'function') {
		throw new Error(name + " JSX " + key + " must be a function.");
	}

	return props[key];
}

function getJsxChildren(props) {
	return normalizeJsxChildren(props && props.children);
}

function getSingleJsxChild(name, props) {
	let children = getJsxChildren(props);
	if (children.length !== 1) {
		throw new Error(name + " JSX requires exactly one child.");
	}
	return children[0];
}

function getSingleRenderPropChild(name, props) {
	let child = getSingleJsxChild(name, props);
	if (typeof child !== 'function') {
		throw new Error(name + " JSX requires a single render-prop child.");
	}
	return child;
}

function toComponent(child) {
	if (child && typeof child === 'object' && hasOwn(child, 'component')) {
		return child.component;
	}

	if (isRenderableComponent(child)) {
		return child;
	}

	if (typeof child === 'function' || isElemNode(child)) {
		return new Elem(child);
	}

	throw new Error("Unsupported JSX child type.");
}

function getSingleJsxComponent(name, props) {
	return toComponent(getSingleJsxChild(name, props));
}

function normalizeFactoryResult(name, value) {
	if (value === null || typeof value === 'undefined' || value === false) {
		return null;
	}

	try {
		return toComponent(value);
	} catch (err) {
		throw new Error(name + " JSX factory must return a component or lowercase JSX node.");
	}
}

function getOptionalProps(props, keys) {
	let opt = null;

	for (let i = 0; i < keys.length; i++) {
		let key = keys[i];
		if (!hasOwn(props, key) || typeof props[key] === 'undefined') {
			continue;
		}

		opt = opt || {};
		opt[key] = props[key];
	}

	return opt;
}

export {
	assertCallbackProp,
	assertNoChildren,
	assertOptionalFunctionProp,
	getOptionalProps,
	getSingleJsxComponent,
	getSingleRenderPropChild,
	hasOwn,
	normalizeFactoryResult,
};
