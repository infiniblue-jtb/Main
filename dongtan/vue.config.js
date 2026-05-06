const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin')
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer')

console.log('--- Vue Config Loading: SEO & Pre-rendering Mode ---');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  configureWebpack: {
    plugins: [
      new PrerendererWebpackPlugin({
        staticDir: path.join(__dirname, 'dist'),
        routes: ['/', '/kids', '/food', '/cafe', '/health', '/blog', '/fun', '/board', '/about', '/privacy'],
        renderer: new PuppeteerRenderer({
          // 이벤트 대신 5초 대기 방식으로 변경하여 확실하게 렌더링
          renderAfterTime: 5000, 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
      })
    ]
  }
})
