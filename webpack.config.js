// webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

// import.meta.url gives you a url like file:///brava/webpack.config.js
// fileURLToPath converts that into a understand path like /brava/webpack.config.js
const __filename = fileURLToPath(import.meta.url);
// will give you the dir name
const __dirname = path.dirname(__filename);

export default {
  mode: 'development', // When the extension is in dev mode making it easier for testing and debuging 
  devtool: 'cheap-module-source-map', // attach changes to the /dist file to make such when changes occur 

  entry: {
    content: './src/content/index.tsx',
    background: './src/background/background.ts',
    popup: './src/popup/index.tsx',
  }, // Three basic properties for 

  output: {
    path: path.resolve(__dirname, 'dist'), // What folder to output the results in 
    filename: '[name].js', // The file name and extension
    clean: true, // Whether on rebuild to deletes everything and re does it
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'manifest.json', to: '.' },
      ],
    }),
  ],
};
