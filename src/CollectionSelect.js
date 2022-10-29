import { RootElem, Txt } from 'modapp-base-component';

/**
 * Select option object
 * @typedef {Object} CollectionSelect~option
 * @property {string} text Option text.
 * @property {string} [value] Option value.
 */

/**
 * Option map callback
 * @callback CollectionSelect~optionMap
 * @param {*} item Item from the collection.
 * @returns {CollectionSelect~option} responseMessage
 */

/**
 * A select component with options based on a Collection.
 */
class CollectionSelect extends RootElem {

	/**
	 * Creates an instance of Select
	 * @param {Iterator} collection Collection of options.
	 * @param {CollectionSelect~optionMap} [optionMap] Map function that takes a collection item and returns an option object.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.selected] Default selected value.
	 * @param {string} [opt.className] Class name.
	 * @param {object} [opt.attributes] Key/value attributes object.
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 * @param {function} [opt.optionFactory] Function that builds an option Component from a collection item, or option object if optionMap is defined.
	 * @param {CollectionSelect~option} [opt.placeholder] Placeholder option object. Eg. { text: "Choose one", value: "" }
	 */
	constructor(collection, optionMap, opt) {
		if (typeof optionMap != 'function') {
			opt = optionMap;
			optionMap = null;
		}

		opt = Object.assign({ optionFactory: o => new Txt(o.text, {
			tagName: 'option',
			className: o.className,
			attributes: {
				value: o.value
			}
		}) }, opt);

		super('select', opt);

		this.optionMap = optionMap || (o => o);
		this.collection = collection || null;
		this.optionFactory = opt.optionFactory;
		this.placeholder = opt.placeholder;
		this.setSelected(opt.selected);

		// Bind callbacks
		this._update = this._update.bind(this);
	}

	/**
	 * Sets the selected option.
	 * @param {string} value The value of the option to set as selected.
	 * @returns {this}
	 */
	setSelected(value) {
		if (typeof value != 'string') {
			value = value ? String(value) : null;
		}
		super.setProperty('value', value);
		this.selected = value;
		return this;
	}

	/**
	 * Gets the selected option.
	 * @returns {string} The value of the selected option.
	 */
	getSelected() {
		return super.getElement()
			? super.getProperty('value')
			: this.selected;
	}

	/**
	 * Sets the collection of options.
	 * @param {Iterator<T>} collection Collection of options.
	 * @returns {this}
	 */
	setCollection(collection) {
		collection = collection || null;
		if (this.collection == collection) {
			return;
		}
		if (!super.getElement()) {
			this.collection = collection;
			return;
		}
		this._setEventListener(false);
		this.collection = collection;
		this._update();
		this._setEventListener(true);
		return this;
	}

	render(el) {
		super.render(el);
		let rel = super.getElement();
		this._renderOptions(rel);
		this._setEventListener(true);
		super.setProperty('value', this.selected);
		return rel;
	}

	unrender() {
		this.selected = super.getProperty('value');
		this._setEventListener(false);
		this._unrenderOptions();
		super.unrender();
	}

	_renderOptions(rel) {
		if (this.placeholder) {
			let c = this.optionFactory(this.placeholder);
			this.placeholderComponent = c;
			c.render(rel);
		}
		this.optionComponents = [];
		if (this.collection) {
			for (let o of this.collection) {
				let c = this.optionFactory(this.optionMap(o));
				let el = c.render(rel);
				this.optionComponents.push({ c, el });
			}
		}
	}

	_unrenderOptions() {
		if (this.placeholderComponent) {
			this.placeholderComponent.unrender();
			this.placeholderComponent = null;
		}
		for (let oc of this.optionComponents) {
			oc.c.unrender();
		}
		this.optionComponents = null;
	}

	_setEventListener(on) {
		if (this.collection && this.collection.on) {
			if (on) {
				this.collection.on('add', this._update);
				this.collection.on('remove', this._update);
			} else {
				this.collection.off('add', this._update);
				this.collection.off('remove', this._update);
			}
		}
	}

	_update() {
		let rel = super.getElement();
		if (rel) {
			this.selected = super.getProperty('value');
			this._unrenderOptions();
			this._renderOptions(rel);
			super.setProperty('value', this.selected);
		}
	}
}

export default CollectionSelect;
