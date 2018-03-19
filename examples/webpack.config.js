var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

// Write out the list of examples to the examples index
var examplesDir = path.resolve(__dirname, 'components')
var examplesIndex = fs.readdirSync(
  examplesDir
)
  .filter(f => f.endsWith('.vue'))
  .map(f => {
    var baseFileName = path.basename(f, '.vue')

    return `
import E${baseFileName}_Source from ${JSON.stringify(`!!raw-loader!${examplesDir}/${f}`)}
import E${baseFileName}_Module from ${JSON.stringify(`${examplesDir}/${f}`)}

examples.push({
  name: ${JSON.stringify(baseFileName)},
  module: E${baseFileName}_Module,
  source: E${baseFileName}_Source,
  description: E${baseFileName}_Module.description,
})
    `
  })

fs.writeFileSync(
  path.resolve(__dirname, 'examples-index.js'),
  `
var examples = []

${examplesIndex.join('\n')}

export default examples
  `
)

var base = {
  output: {
    path: path.resolve('./dist'),
    publicPath: 'dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader'
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        // edit this for additional asset file types
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader?name=[name].[ext]?[hash]',
      }
    ],
  },
};


if (process.env.NODE_ENV === 'production') {
  base.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ];
} else {
  base.devtool = 'source-map';
}

module.exports = [
  Object.assign({}, base, {entry: './src/main.js', output: Object.assign({}, base.output, {filename: 'build.js'})}),
  Object.assign({}, base, {entry: './src/ExamplesMain.js', output: Object.assign({}, base.output, {filename: 'build-examples.js'})}),
]
