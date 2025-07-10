const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

module.exports = {
  // 1) Polyfills pour les modules manquants
  resolve: {
    fallback: {
      // Node core
      util: require.resolve('util/'),
      buffer: require.resolve('buffer/'),
      // packages utilisés par @readyplayerme/visage
      '@react-three/postprocessing': require.resolve('@react-three/postprocessing'),
      '@amplitude/analytics-browser': require.resolve('@amplitude/analytics-browser'),
    },
  },

  // 2) Tes règles existantes
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: 'asset',
      },
      // ... (tes autres loaders si tu en as)
    ],
  },

  // 3) Ton optimisation actuelle
  optimization: {
    minimizer: [
      '...',
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                { xmlns: 'http://www.w3.org/2000/svg' },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
}
