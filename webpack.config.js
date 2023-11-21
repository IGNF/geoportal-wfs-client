import webpack from "webpack";
import path from "path";
import ESLintPlugin from 'eslint-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import TerserPlugin from "terser-webpack-plugin";

const __dirname = path.resolve();

let config = {

  entry: {
    'geoportal-wfs-client': ['./src/Client.js'],
    'geoportal-wfs-client.min': ['./src/Client.js'],
  },
  output: {
    library: {
      name: 'GeoportalWfsClient',
      type: 'umd',
      export: "default"
    },
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    globalObject: 'this'
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: false,
      dry: false
    }),
    new NodePolyfillPlugin(),
    new ESLintPlugin({
      extensions: ['js'],
      exclude: ["node_modules"],
      fix: true
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.min\.js$/,
        extractComments: false // Empécher la création de fichiers *.LICENCE.txt inutiles
      })
    ],
    minimize: true,
  },

};

export default config;
