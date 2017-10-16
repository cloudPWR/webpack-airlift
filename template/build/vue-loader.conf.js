'use strict'
const utils = require('./utils')
const config = (process.env.build_type === 'production') ?
  require('../config/prod') :
  require('../config/watch')

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: config.build.productionSourceMap
  }),
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
