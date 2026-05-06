const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin')
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new PrerendererWebpackPlugin({
          staticDir: path.join(__dirname, 'dist'),
          routes: ['/', '/kids', '/food', '/cafe', '/health', '/blog', '/fun', '/board', '/about', '/privacy'],
          renderer: new PuppeteerRenderer({
            renderAfterDocumentEvent: 'render-event',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          })
        })
      )
    }
  }
})
