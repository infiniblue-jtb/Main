const path = require('path')
const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin')

console.log('--- [DEBUG] VUE CONFIG START ---');

module.exports = {
  publicPath: '/',
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new PrerendererWebpackPlugin({
        staticDir: path.join(__dirname, 'dist'),
        routes: ['/', '/kids', '/food', '/cafe', '/health', '/blog', '/fun', '/board', '/about', '/privacy'],
        renderer: '@prerenderer/renderer-puppeteer',
        rendererOptions: {
          // 한 번에 한 페이지만 처리 (메모리 절약)
          maxConcurrentRoutes: 1,
          renderAfterTime: 5000,
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
      })
    ]
  }
}
