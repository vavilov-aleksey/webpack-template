const path = require('path');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const parts = require('./webpack.parts');

const paths = getPaths();

const cssPreprocessorLoader = { loader: 'fast-sass-loader' };

const commonConfig = merge([
  {
    context: paths.src,
    resolve: {
      unsafeCache: true,
      symlinks: false
    },
    entry: ['@babel/polyfill', `${paths.src}/scripts`],
    output: {
      path: paths.build,
      publicPath: parts.publicPath
    },
    module: {
      noParse: /\.min\.js/
    },
    devtool: 'source-map'
  },
  parts.loadPug(),
  parts.loadSvg({
    include: paths.src,
    options: {
      name: `${paths.images}/[name].svg`
    }
  }),
  parts.loadFonts({
    include: paths.src,
    options: {
      name: `${paths.fonts}/[name].[ext]`
    }
  }),
  parts.loadImages({
    include: paths.src,
    options: {
      limit: 15000,
      esModule: false,
      name: `${paths.images}/[name].[ext]`
    }
  }),
]);

const productionConfig = merge([
  {
    mode: 'production',
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    output: {
      chunkFilename: `${paths.js}/[name].js`,
      filename: `${paths.js}/[name].js`
    },
    performance: {
      hints: 'warning',
      maxEntrypointSize: 100000,
      maxAssetSize: 450000
    },
    plugins: [
      new CleanWebpackPlugin()
    ]
  },
  parts.minifyJS({
    terserOptions: {
      parse: {
        ecma: 8
      },
      compress: {
        ecma: 5,
        warnings: false,
        comparisons: false
      },
      mangle: {
        safari10: true
      },
      output: {
        ecma: 5,
        comments: false,
        ascii_only: true
      }
    },
    parallel: true,
    cache: true
  }),
  parts.loadJS({
    include: paths.src,
    options: {
      cacheDirectory: true
    }
  }),
  parts.extractCSS({
    include: paths.src,
    use: [parts.autoprefix(), cssPreprocessorLoader],
    options: {
      filename: `${paths.css}/[name].css`,
    }
  }),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true
      }
    }
  }),
  parts.optimizeImages()
]);

const developmentConfig = merge([
  {
    mode: 'development'
  },
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT
  }),
  parts.loadCSS({ include: paths.src, use: [cssPreprocessorLoader] }),
  parts.loadJS({ include: paths.src }),
]);

const pages = [
  {
    filename: 'index.html',
    template: path.join(paths.src, 'pages', 'index.pug')
  },
  {
    filename: 'main.html',
    template: path.join(paths.src, 'pages', 'Main', 'main.pug')
  },
  {
    filename: 'other.html',
    template: path.join(paths.src, 'pages', 'Other', 'other.pug')
  }
].map(options => parts.page(options));

module.exports = env => {
  process.env.NODE_ENV = env;

  return merge(
    commonConfig,
    env === 'production' ? productionConfig : developmentConfig,
    ...pages
  )
};

function getPaths ({
  sourceDir = 'src',
  buildDir = 'build',
  staticDir = '',
  images = 'assets/images',
  fonts = 'assets/fonts',
  js = 'scripts',
  css = 'styles'
} = {}) {debugger
  const assets = { images, fonts, js, css };

  return Object.keys(assets).reduce((obj, assetName) => {
    const assetPath = assets[assetName];

    obj[assetName] = !staticDir ? assetPath : `${staticDir}/${assetPath}`;

    return obj
  }, {
    src: path.join(__dirname, sourceDir),
    build: path.join(__dirname, buildDir),
    staticDir
  })
}