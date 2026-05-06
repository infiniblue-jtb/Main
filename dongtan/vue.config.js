const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  configureWebpack: {
    plugins: [
      new PrerendererWebpackPlugin({
        routes: ['/', '/kids', '/food', '/cafe', '/health', '/blog', '/fun', '/board', '/about', '/privacy'],
        renderer: '@prerenderer/renderer-puppeteer',
        rendererOptions: {
          renderAfterDocumentEvent: 'render-event',
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      })
    ]
  }
})
