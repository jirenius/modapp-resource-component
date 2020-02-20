import { Elem, RootElem } from 'modapp-base-component';

// A component rendering a key,value pair
class Pair extends RootElem {

	/**
     * Creates a new Pair instance
     * @param {Elem~node} key Key node
     * @param {Elem~node} value Value node
     */
	constructor(key, value) {
		super();
		this.key = new Elem(key);
		this.value = new Elem(value);
	}

	render(el) {
		this.key.render(el);
		this.value.render(el);
	}

	unrender() {
		this.key.unrender();
		this.value.unrender();
	}
}

export default Pair;
