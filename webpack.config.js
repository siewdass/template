const path = require( 'path' )
const webpack = require( 'webpack' )
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/index.js'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/preset-env", "@babel/preset-react"
            ]
          }
        }
      }
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    path: path.resolve( __dirname, './dist' )
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body'
    }),
    new HtmlInlineScriptPlugin()
  ],
  devServer: {
    host: '0.0.0.0',
    //static: path.resolve(__dirname, './dist'),
    hot: true,
    port: 4001,
    server: 'http',
    historyApiFallback: true,
    allowedHosts: 'all',
  }
}

