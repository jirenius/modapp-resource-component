import { anim } from 'modapp-utils';
import { RootElem } from 'modapp-base-component';

/**
 * A component rendering a list of items based on a collection
 */
class CollectionList extends RootElem {

	/**
	 * Creates an instance of CollectionList
	 * @param {Collection} collection Iterable list of items
	 * @param {function} componentFactory  A factory function taking a collection item as argument, returning a component.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.tagName] Tag name (eg. 'ul') for the element. Defaults to 'div'.
	 * @param {string} [opt.className] Class name
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 * @param {string} [opt.subTagName] Tag name (eg. 'li') for the element. Defaults to 'div'.
	 * @param {string} [opt.subClassName] A factory function taking a collection item as argument, returning the className for the component.
	 * @param {bool} [opt.horizontal] Sets the slide animation to horizontal. Defaults to false.
	 * @param {number} [opt.duration] Animation duration in milliseconds.
	 */
	constructor(collection, componentFactory, opt) {
		opt = Object.assign({ tagName: 'div' }, opt);

		super(opt.tagName, opt);

		this.collection = null;
		this.componentFactory = componentFactory;
		this.subTagName = opt.subTagName || 'div';
		this.subClassName = opt.subClassName || null;
		this.animType = opt.horizontal ? 'slideHorizontal' : 'slideVertical';
		this.duration = opt.duration || null;

		this.components = null;
		this.removedComponents = [];

		this._add = this._add.bind(this);
		this._remove = this._remove.bind(this);

		this._rel = null; // Root elements node

		this.setCollection(collection);
	}

	/**
	 * Sets the collection.
	 * If the component is rendered, the list will be rerendered with
	 * the new collection, without any animation.
	 * @param {?Collection} collection Iterable list of items
	 * @returns {this}
	 */
	setCollection(collection) {
		collection = collection || null;

		if (collection === this.collection) {
			return this;
		}

		if (!this._rel) {
			this.collection = collection;
			return this;
		}

		this._unrenderComponents();
		this.collection = collection;
		this._renderComponents();
		this._checkSync();
		return this;
	}

	/**
	 * Gets the current collection
	 * @returns {?Collection}
	 */
	getCollection() {
		return this.collection;
	}

	/**
	 * Get the component for a model by index
	 * @param {number} idx Index if model
	 * @returns {?Component} Model component, or null if the list isn't rendered, or if index is out of bounds
	 */
	getComponent(idx) {
		if (!this._rel) {
			return null;
		}

		let cont = this.components[idx];
		return cont ? cont.component : null;
	}

	/**
	 * Waits for the synchronization of the collection and component list to
	 * ensure the collection models matches the rendered components.
	 * Calling this method is necessary when calling getComponent after
	 * adding/removing items from the collections.
	 * Callback will never be called if the CollectionList isn't rendered, or
	 * if it unrenders before it has been synchronized.
	 * @param {function} callback Callback function called when collection and component list is synchronized.
	 */
	sync(callback) {
		if (!this._rel) {
			return;
		}

		if (this._syncCallbacks) {
			this._syncCallbacks.push(callback);
		} else {
			this._syncCallbacks = [ callback ];
		}

		this._checkSync();
	}

	render(el) {
		this._rel = super.render(el);
		this._renderComponents();
		return this._rel;
	}

	unrender() {
		this._unrenderComponents();
		this._syncCallbacks = null;
		super.unrender();
		this._rel = null;
	}

	_checkSync() {
		// No use checking syncronization if noone cares.
		if (!this._syncCallbacks) {
			return;
		}

		let i = 0, comp, len = this.components.length;
		for (let model of this.collection) {
			// More models in the collection than components
			if (i === len) {
				return;
			}

			comp = this.components[i++];
			if (model !== comp.model) {
				return;
			}
		}

		// Do we have more components?
		if (i !== length) {
			return;
		}

		// We are in sync
		for (let cb of this._syncCallbacks) {
			cb();
		}
		this._syncCallbacks = null;
	}

	_setSubClassName(item, li) {
		if (this.subClassName) {
			let className = this.subClassName(item);
			if (className) {
				li.className = className;
			}
		}
	}

	_renderComponents() {
		if (!this.collection) {
			return;
		}

		this.components = [];
		let idx = 0;

		for (let item of this.collection) {
			let component = this.componentFactory(item, idx);
			let li = document.createElement(this.subTagName);
			this.components.push({ item, component, li });
			this._setSubClassName(item, li);

			this._rel.appendChild(li);
			if (component) {
				component.render(li);
			}
			idx++;
		}

		this._setEventListener(true);
	}

	_unrenderComponents() {
		if (!this.collection) {
			return;
		}

		for (let cont of this.components) {
			this._removeComponent(cont);
		}
		this.components = null;

		for (let cont of this.removedComponents) {
			this._removeComponent(cont);
		}
		this.removedComponents = [];

		this._setEventListener(false);
	}

	// Callback when the collection have an add event
	_add(e) {
		// Assert component wasn't unrendered by another event handler
		if (!this._rel) {
			return;
		}

		let { item, idx } = e;
		let component = this.componentFactory(item, idx);
		let li = document.createElement(this.subTagName);
		let cont = { model: item, component, li };
		this.components.splice(idx, 0, cont);
		this._setSubClassName(item, li);

		li.style.display = 'none';
		// Append last?
		if (this.components.length - 1 === idx) {
			this._rel.appendChild(li);
		} else {
			this._rel.insertBefore(li, this.components[idx + 1].li);
		}

		if (component) {
			component.render(li);
		}

		cont.token = anim[this.animType](li, true, { reset: true, duration: this.duration });
		this._checkSync();
	}


	// Callback when the collection have a remove event
	_remove(e) {
		// Assert component wasn't unrendered by another event handler
		if (!this._rel) {
			return;
		}

		let cont = this.components[e.idx];
		this.components.splice(e.idx, 1);
		this.removedComponents.push(cont);

		anim.stop(cont.token);
		cont.token = anim[this.animType](cont.li, false, {
			callback: () => {
				let idx = this.removedComponents.indexOf(cont);
				if (idx >= 0) {
					this.removedComponents.splice(idx, 1);
					this._removeComponent(cont);
				}
			},
			duration: this.duration
		});

		this._checkSync();
	}

	_removeComponent(cont) {
		if (!this._rel) {
			return;
		}

		let { token, component } = cont;
		anim.stop(token);
		if (component) {
			component.unrender();
		}

		this._rel.removeChild(cont.li);
	}

	_setEventListener(on) {
		if (this.collection && this.collection.on) {
			if (on) {
				this.collection.on('add', this._add);
				this.collection.on('remove', this._remove);
			} else {
				this.collection.off('add', this._add);
				this.collection.off('remove', this._remove);
			}
		}
	}
}

export default CollectionList;
