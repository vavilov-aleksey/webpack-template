const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
const MiniCssExtractPlugin      = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const publicPath = '/';

exports.publicPath = publicPath;

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    watchOptions: {
      ignored: /node_modules/
    },
    publicPath,
    historyApiFallback: true,
    host,
    port,
    overlay: {
      errors: true,
      warnings: false
    }
  }
});

const sharedCSSLoaders = [
  {
    loader: 'css-loader'
  }
];

exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => [require('autoprefixer')]
  }
});

// --- Pug
exports.loadPug = (options) => ({
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader'
          },
          {
            loader: 'pug-html-loader',
            options
          }
        ]
      }
    ]
  }
});

// --- Fonts
exports.loadFonts = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,

        include,
        exclude,

        use: {
          loader: 'file-loader',
          options
        }
      }
    ]
  }
});

// --- Images
exports.loadSvg = ({ include, options }) => ({
  module: {
    rules: [
      {
        test: /\.svg$/,

        include,

        use: {
          loader: 'file-loader',
          options
        }
      }
    ]
  }
});

exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,

        include,
        exclude,

        use: {
          loader: 'url-loader',
          options
        }
      }
    ]
  }
});

exports.optimizeImages = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g)$/i,

        include,
        exclude,

        use: {

          loader: 'image-webpack-loader',

        }
      }
    ]
  }
});

// --- Css
exports.loadCSS = ({ include, exclude, use } = {}) => ({
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,

        include,
        exclude,

        use: [
          {
            loader: 'style-loader'
          },
          ...sharedCSSLoaders.concat(use)
        ]
      }
    ]
  }
});

exports.extractCSS = ({ include, exclude, options, use = [] } = {}) => ({
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,

        include,
        exclude,

        use: [MiniCssExtractPlugin.loader, ...sharedCSSLoaders, ...use]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(options)
  ]
});

exports.minifyCSS = ({ options }) => ({
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: options,
        canPrint: true
      })
    ]
  }
});

// --- JS
exports.loadJS = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,

        include,
        exclude,

        loader: 'babel-loader',
        options
      }
    ]
  }
});

exports.minifyJS = options => ({
  optimization: {
    minimizer: [
      new TerserPlugin(options)
    ]
  }
});

// --- Common
exports.page = ({
  path = '',
  template = require.resolve(
    'html-webpack-plugin/default_index.ejs'
  ),
  title,
  entry,
  filename
} = {}) => ({
  entry,
  plugins: [
    new HtmlWebpackPlugin({
      filename,
      template,
      title
    }),
    new HtmlBeautifyPlugin()
  ]
});
