import CollectionListener from './utils/CollectionListener';

/**
 * Update callback function
 * @callback CollectionComponent~updateCallback
 * @param {Collection} collection Collection
 * @param {Component} component Component
 * @param {?object} event Collection's event parameters. Null if the callback is triggered by render or setCollection.
 */

/**
 * A generic component wrapper that listens to add/remove events on a collection, calling update on event.
 */
class CollectionComponent {

	/**
	 * Creates a new CollectionComponent instance
	 * @param {Collection} [collection] Optional collection object
	 * @param {Component} component Component
	 * @param {CollectionComponent~updateCallback} update Callback function called on collection events and when component is rendered
	 * @param {object} [opt] Optional parameters
	 * @param {string} [opt.postrenderUpdate] Flag setting if call to update should be done after render. Defaults to false.
	 */
	constructor(collection, component, update, opt) {
		if (typeof component === 'function') {
			update = component;
			component = collection;
			collection = null;
		}
		this.postrender = !!(opt && opt.postrenderUpdate);

		this.ml = new CollectionListener(collection, component, update);
	}

	/**
	 * Set collection
	 * If component is rendered, update will be triggered.
	 * @param {?Collection} collection Collection
	 * @returns {this}
	 */
	setCollection(collection) {
		this.ml.setCollection(collection);
		return this;
	}

	/**
	 * Returns the wrapped component
	 * @returns {Component} Wrapped component
	 */
	getComponent() {
		return this.ml.component;
	}

	render(el) {
		if (!this.postrender) this.ml.onRender();
		let rel = this.ml.component.render(el);
		if (this.postrender) this.ml.onRender();
		return rel;
	}

	unrender() {
		this.ml.component.unrender();
		this.ml.onUnrender();
	}
}

export default CollectionComponent;
