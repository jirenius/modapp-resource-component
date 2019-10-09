import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

export default {
	input: 'src/index.js',
	output: {
		format: 'umd',
		name: 'modapp-resource-component',
		exports: 'named',
		globals: {
			'modapp-base-component': 'modapp-base-component'
		}
	},
	external: [ 'modapp-base-component' ],
	plugins: [
		resolve({
			mainFields: [ 'jsnext:main', 'main', 'browser' ]
		}),
		babel({
			exclude: 'node_modules/**'
		}),
		commonjs(),
		(process.env.NODE_ENV === 'production' && uglify()),
	],
};
