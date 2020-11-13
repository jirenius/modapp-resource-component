import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/index.js',
	external: [ 'modapp-base-component' ],
	output: {
		name: 'modapp-resource-component',
		format: 'umd',
		exports: 'named',
		globals: {
			'modapp-base-component': 'modapp-base-component'
		}
	},
	plugins: [
		babel({ babelHelpers: 'bundled' }),
		resolve(),
		(process.env.NODE_ENV === 'production' && terser()),
	],
};
