const VueLoaderPlugin = require('vue-loader/lib/plugin')

const path = require('path');

module.exports = env => {
  return {
    entry: {
      home: './assets/javascripts/pages/home.js'
    },
    output: {
      path: path.resolve(__dirname, '_bundled/javascripts'),
      filename: "[name].js"
    },
    mode: env.ENV,
    devtool: env.DEV_TOOL,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          include: path.resolve(__dirname, 'assets/javascripts'),
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        },
        {
          test: /\.vue$/,
          exclude: /(node_modules)/,
          include: [
            path.resolve(__dirname, 'assets/javascripts/components')
          ],
          loader: 'vue-loader'
        },
        {
          test: /\.css$/,
          include: [
            path.resolve(__dirname, 'assets/javascripts/components')
          ],
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        }
      ]
    },
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.common.js'
      }
    },
    plugins: [
      new VueLoaderPlugin()
    ],
    externals: { moment: 'moment' }
  }
};
