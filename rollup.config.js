import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

var env = process.env.NODE_ENV;

var config = {
  format: 'umd',
  moduleName: 'StripchatEmbedded',
  plugins: [
    commonjs(),
  ]
}

if (env !== 'development') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
