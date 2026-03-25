const assert = require('assert');
const runtime = require('modapp-base-component/jsx/jsx-runtime');
const baseJsxModule = require('modapp-base-component/jsx');
const rootModule = require('../.test-lib/index.js');
const jsxModule = require('../.test-lib/jsx/index.js');
const pkg = require('../package.json');

const BaseElem = baseJsxModule.Elem;
const BaseTxt = baseJsxModule.Txt;
const CollectionComponent = jsxModule.CollectionComponent;
const CollectionList = jsxModule.CollectionList;
const CollectionSelect = jsxModule.CollectionSelect;
const jsx = runtime.jsx;
const jsxs = runtime.jsxs;
const ModelButton = jsxModule.ModelButton;
const ModelCheckbox = jsxModule.ModelCheckbox;
const ModelComponent = jsxModule.ModelComponent;
const ModelFragment = jsxModule.ModelFragment;
const ModelHtml = jsxModule.ModelHtml;
const ModelInput = jsxModule.ModelInput;
const ModelList = jsxModule.ModelList;
const ModelRadio = jsxModule.ModelRadio;
const ModelTextarea = jsxModule.ModelTextarea;
const ModelTxt = jsxModule.ModelTxt;

function test(name, callback) {
	try {
		callback();
		console.log('PASS', name);
	} catch (err) {
		console.error('FAIL', name);
		throw err;
	}
}

test('keeps base exports free from JSX adapters', function() {
	assert.strictEqual(typeof rootModule.ModelTxt.fromJSX, 'undefined');
	assert.strictEqual(typeof rootModule.ModelComponent.fromJSX, 'undefined');
	assert.strictEqual(typeof jsxModule.mapJsxProps, 'undefined');
});

test('publishes a jsx subpath export', function() {
	assert.ok(pkg.exports);
	assert.ok(pkg.exports['./jsx']);
	assert.strictEqual(pkg.exports['./jsx'].require, './lib/jsx/index.js');
	assert.strictEqual(pkg.exports['./jsx'].import, './es/jsx/index.js');
});

test('creates ModelTxt and ModelHtml instances from JSX tags', function() {
	let model = { name: 'Hello' };
	let update = function(m) { return m.name; };
	let txt = jsx(ModelTxt, {
		model,
		update,
		className: 'greeting',
		as: 'strong',
		duration: 0,
		nodeId: 'txt-node',
	});
	let html = jsx(ModelHtml, {
		update,
		className: 'markup',
		as: 'section',
	});

	assert.ok(txt instanceof ModelTxt);
	assert.strictEqual(txt.getModel(), model);
	assert.strictEqual(txt.update, update);
	assert.strictEqual(txt._rootElem.node.className, 'greeting');
	assert.strictEqual(txt._rootElem.node.tagName, 'strong');
	assert.strictEqual(txt._duration, 0);
	assert.strictEqual(Object.prototype.hasOwnProperty.call(txt._rootElem.node, 'id'), false);
	assert.ok(html instanceof ModelHtml);
	assert.strictEqual(html.update, update);
	assert.strictEqual(html._rootElem.node.className, 'markup');
	assert.strictEqual(html._rootElem.node.tagName, 'section');
});

test('creates input-style model components from JSX tags', function() {
	let update = function() { return true; };
	let checkbox = jsx(ModelCheckbox, { update, className: 'toggle' });
	let radio = jsx(ModelRadio, { update, attributes: { name: 'group' } });
	let input = jsx(ModelInput, { update, className: 'field' });
	let textarea = jsx(ModelTextarea, { update, className: 'copy' });

	assert.ok(checkbox instanceof ModelCheckbox);
	assert.strictEqual(checkbox.update, update);
	assert.strictEqual(checkbox._rootElem.node.className, 'toggle');
	assert.ok(radio instanceof ModelRadio);
	assert.strictEqual(radio._rootElem.node.attributes.name, 'group');
	assert.ok(input instanceof ModelInput);
	assert.strictEqual(input._rootElem.node.className, 'field');
	assert.ok(textarea instanceof ModelTextarea);
	assert.strictEqual(textarea._rootElem.node.className, 'copy');
});

test('creates ModelButton with update and onClick from JSX', function() {
	let update = function(m) { return m && m.label; };
	let click = function(ctx, ev) {};
	let button = jsx(ModelButton, {
		update,
		onClick: click,
		className: 'action',
		as: 'a',
	});

	assert.ok(button instanceof ModelButton);
	assert.strictEqual(button.update, update);
	assert.strictEqual(button.click, click);
	assert.strictEqual(button._rootElem.node.className, 'action');
	assert.strictEqual(button._rootElem.node.tagName, 'a');
	assert.strictEqual(!!(button._rootElem.node.attributes && Object.prototype.hasOwnProperty.call(button._rootElem.node.attributes, 'text')), false);
});

test('requires exactly one child for wrapped component adapters', function() {
	let update = function() {};
	let modelComponent = jsx(ModelComponent, {
		update,
		children: jsx('span', { children: 'Hello' }),
	});
	let collectionComponent = jsx(CollectionComponent, {
		update,
		children: jsx(ModelTxt, { update: function() { return 'Hello'; } }),
	});

	assert.ok(modelComponent instanceof ModelComponent);
	assert.strictEqual(modelComponent.getComponent().node.tagName, 'span');
	assert.ok(collectionComponent instanceof CollectionComponent);
	assert.ok(collectionComponent.getComponent() instanceof ModelTxt);

	assert.throws(function() {
		jsx(ModelComponent, { update });
	}, /requires exactly one child/);
	assert.throws(function() {
		jsx(CollectionComponent, {
			update,
			component: new BaseTxt("Hello"),
			children: jsx('span', { children: 'Hello' }),
		});
	}, /uses a single child/);
});

test('uses render-prop children for ModelFragment and list wrappers', function() {
	let fragment = jsx(ModelFragment, {
		model: { props: { name: 'Ada' } },
		children: function(key, value) {
			return jsx('span', { children: value });
		},
	});
	let modelList = jsx(ModelList, {
		model: { props: { name: 'Ada' } },
		className: 'pairs',
		as: 'ul',
		subTagName: 'li',
		children: function(key, value) {
			return jsx(ModelTxt, { update: function() { return key + ':' + value; } });
		},
	});
	let collectionList = jsx(CollectionList, {
		collection: [ 'a', 'b' ],
		horizontal: true,
		duration: 10,
		children: function(item) {
			return jsx('span', { children: item });
		},
	});

	assert.ok(fragment instanceof ModelFragment);
	assert.strictEqual(fragment._factory('name', 'Ada').node.tagName, 'span');
	assert.ok(modelList instanceof ModelList);
	assert.strictEqual(modelList.componentFactory('name', 'Ada').update(), 'name:Ada');
	assert.strictEqual(modelList._rootElem.node.className, 'pairs');
	assert.strictEqual(modelList._rootElem.node.tagName, 'ul');
	assert.strictEqual(modelList.subTagName, 'li');
	assert.ok(collectionList instanceof CollectionList);
	assert.strictEqual(collectionList.componentFactory('a', 0).node.tagName, 'span');
	assert.strictEqual(collectionList.animType, 'slideHorizontal');
	assert.strictEqual(collectionList.duration, 10);

	assert.throws(function() {
		jsx(ModelFragment, { factory: function() {}, children: function() { return null; } });
	}, /render-prop child instead of factory/);
	assert.throws(function() {
		jsx(ModelList, { model: {}, componentFactory: function() {}, children: function() { return null; } });
	}, /render-prop child instead of componentFactory/);
	assert.throws(function() {
		jsx(CollectionList, { collection: [], children: jsx('span', { children: 'bad' }) });
	}, /single render-prop child/);
});

test('supports as as an alias for tagName on resource JSX wrappers', function() {
	let txt = jsx(ModelTxt, { as: 'h1', update: function() { return 'Hello'; } });
	let button = jsx(ModelButton, { as: 'a', update: function() { return 'Go'; } });
	let html = jsx(ModelHtml, { as: 'article', update: function() { return '<b>Hi</b>'; } });
	let modelList = jsx(ModelList, {
		as: 'ul',
		children: function() { return jsx('span', { children: 'Hello' }); },
	});
	let collectionList = jsx(CollectionList, {
		as: 'ol',
		children: function() { return jsx('span', { children: 'Hello' }); },
	});

	assert.strictEqual(txt._rootElem.node.tagName, 'h1');
	assert.strictEqual(button._rootElem.node.tagName, 'a');
	assert.strictEqual(html._rootElem.node.tagName, 'article');
	assert.strictEqual(modelList._rootElem.node.tagName, 'ul');
	assert.strictEqual(collectionList._rootElem.node.tagName, 'ol');
});

test('keeps explicit tagName precedence over as on resource JSX wrappers', function() {
	let txt = jsx(ModelTxt, {
		as: 'h1',
		tagName: 'strong',
		update: function() { return 'Hello'; },
	});
	let modelList = jsx(ModelList, {
		as: 'ul',
		tagName: 'dl',
		children: function() { return jsx('span', { children: 'Hello' }); },
	});

	assert.strictEqual(txt._rootElem.node.tagName, 'strong');
	assert.strictEqual(modelList._rootElem.node.tagName, 'dl');
});

test('creates CollectionSelect from props and normalizes optionFactory results', function() {
	let select = jsx(CollectionSelect, {
		collection: [ { text: 'Alpha', value: 'a' } ],
		selected: 'a',
		placeholder: { text: 'Choose', value: '' },
		optionMap: function(item) { return item; },
		optionFactory: function(option) {
			return jsx('option', {
				children: option.text,
				value: option.value,
			});
		},
		className: 'picker',
	});
	let option = select.optionFactory({ text: 'Beta', value: 'b' });

	assert.ok(select instanceof CollectionSelect);
	assert.strictEqual(select.selected, 'a');
	assert.strictEqual(select.placeholder.text, 'Choose');
	assert.strictEqual(select._rootElem.node.className, 'picker');
	assert.strictEqual(option.node.tagName, 'option');
	assert.strictEqual(option.node.children[0].text, 'Beta');
	assert.strictEqual(option.node.properties.value, 'b');

	assert.throws(function() {
		jsx(CollectionSelect, {
			children: jsx('option', { children: 'bad' }),
		});
	}, /does not support children/);
});

test('preserves nodeId when resource JSX components are embedded in Elem trees', function() {
	let elem = new BaseElem(jsx('div', {
		children: jsx(ModelTxt, {
			nodeId: 'mytext',
			update: function() { return 'Hello'; },
		}),
	}));

	let txt = elem.getNode('mytext');
	assert.ok(txt instanceof ModelTxt);
	assert.strictEqual(txt.update(), 'Hello');
});

test('rejects invalid child and callback shapes', function() {
	assert.throws(function() {
		jsx(ModelTxt, { children: 'Hello', update: function() {} });
	}, /does not support children/);
	assert.throws(function() {
		jsx(ModelTxt, {});
	}, /requires a update callback/);
	assert.throws(function() {
		jsx(ModelButton, { update: function() {}, onClick: 'nope' });
	}, /onClick must be a function/);
	assert.throws(function() {
		jsx(CollectionSelect, { optionMap: 'nope' });
	}, /optionMap must be a function/);

	let invalidList = jsx(ModelList, {
		children: function() {
			return [ jsx('span', { children: 'bad' }) ];
		},
	});

	assert.throws(function() {
		invalidList.componentFactory('bad', 'value');
	}, /factory must return a component or lowercase JSX node/);
});
