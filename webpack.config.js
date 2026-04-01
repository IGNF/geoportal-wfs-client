import webpack from "webpack";
import path from "path";
import { createRequire } from "module";
import ESLintPlugin from 'eslint-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from "terser-webpack-plugin";

const require = createRequire(import.meta.url);

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
  resolve: {
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      process: require.resolve("process/browser.js"),
      url: require.resolve("url/"),
    },
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: false,
      dry: false
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: require.resolve("process/browser.js"),
    }),
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
