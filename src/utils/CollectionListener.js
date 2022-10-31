/**
 * Update callback function
 * @callback CollectionListener~updateCallback
 * @param {Collection} collection Collection
 * @param {Component} component Component received in CollectionListener constructor.
 * @param {?object} event Collection's event parameters. Null if the callback is triggered by render or setCollection.
 */

/**
 * A helper class for collection components
 */
class CollectionListener {

	/**
	 * Creates a new CollectionListener instance
	 * @param {Collection} [collection] Optional collection object
	 * @param {Component} component Component
	 * @param {CollectionListener~updateCallback} update Callback function called on collection add/remove events and when component is rendered
	 * @param {object} [opt] Optional parameters
	 * @param {string} [opt.postrenderUpdate] Flag setting if call to update should be done after render. Defaults to false.
	 */
	constructor(collection, component, update, opt) {
		this.collection = collection;
		this.component = component;
		this.update = update;
		this.rendered = false;

		this._onAdd = this._onEvent.bind(this, 'add');
		this._onRemove = this._onEvent.bind(this, 'remove');
	}

	onRender() {
		this._setEventListener(true);
		this._update(null);
		this.rendered = true;
	}

	onUnrender() {
		this._setEventListener(false);
		this.rendered = false;
	}

	/**
	 * Set collection
	 * If component is rendered, update will be triggered.
	 * @param {?Collection} collection Collection
	 * @returns {this}
	 */
	setCollection(collection) {
		collection = collection || null;
		if (collection === this.collection) {
			return;
		}

		if (this.rendered) {
			this._setEventListener(false);
			this.collection = collection;
			this._setEventListener(true);
			this._update(null);
		} else {
			this.collection = collection;
		}

		return this;
	}

	/**
	 * Gets the current collection
	 * @returns {?Collection}
	 */
	getCollection() {
		return this.collection;
	}

	_setEventListener(on) {
		if (!this.collection || !this.collection.on || !this.update) {
			return;
		}

		let cb = on ? 'on' : 'off';
		this.collection[cb]('add', this._onAdd);
		this.collection[cb]('remove', this._onRemove);
	}

	_onEvent(event, e) {
		e = Object.assign({ event }, e);
		this._update(e);
	}

	_update(e) {
		if (this.update) {
			this.update(this.collection, this.component, e);
		}
	}
}

export default CollectionListener;
