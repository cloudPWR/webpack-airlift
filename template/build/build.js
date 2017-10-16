'use strict'
require('./check-versions')()

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config/watch')
const argv = require('yargs')
  .boolean('production')
  .argv

process.env.build_type = ( argv.production ) ? "production" : "watch";

const webpackConfig = require('./webpack.conf')

const spinner = ora(`Build for ${(argv.production) ? 'production' : 'development'}...`)
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))

    if(!argv.production)
      console.log(chalk.cyan('  Watching...\n'))
  })
})
