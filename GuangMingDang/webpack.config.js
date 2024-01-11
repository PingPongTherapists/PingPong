const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.css$/, // Targets CSS files
        use: [
          'style-loader', // Injects CSS into the DOM
          'css-loader',   // Interprets `@import` and `url()`
          'postcss-loader' // Processes CSS with PostCSS
        ]
      }
    ]
  }
};
