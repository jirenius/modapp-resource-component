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
			'modapp-l10n': 'modapp-l10n',
			'modapp-base-component': 'modapp-base-component'
		}
	},
	external: [ 'modapp-l10n', 'modapp-base-component' ],
	plugins: [
		resolve({
			jsnext: true,
			main: true,
			browser: true,
		}),
		babel({
			exclude: 'node_modules/**',
<<<<<<< HEAD
			plugins: [ 'external-helpers' ]
=======
>>>>>>> 4a5f772f33dd634515afd1009643b0ec23ec8f15
		}),
		commonjs(),
		(process.env.NODE_ENV === 'production' && uglify()),
	],
};
