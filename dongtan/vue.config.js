const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin')
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugin('prerender').use(PrerendererWebpackPlugin, [{
        staticDir: path.join(__dirname, 'dist'),
        routes: ['/', '/kids', '/food', '/cafe', '/health', '/blog', '/fun', '/board', '/about', '/privacy'],
        renderer: new PuppeteerRenderer({
          renderAfterTime: 5000,
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }),
        server: {
          port: 8080
        }
      }])
    }
  }
})
