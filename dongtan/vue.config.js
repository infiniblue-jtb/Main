const path = require('path')
const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin')

console.log('--- [DEBUG] VUE CONFIG START (v1.0.8) ---');

module.exports = {
  publicPath: '/',
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new PrerendererWebpackPlugin({
        staticDir: path.join(__dirname, 'dist'),
        // 출력 경로를 staticDir와 동일하게 명시
        outputDir: path.join(__dirname, 'dist'),
        routes: ['/', '/kids', '/food', '/cafe', '/health', '/blog', '/fun', '/board', '/about', '/privacy'],
        renderer: '@prerenderer/renderer-puppeteer',
        rendererOptions: {
          maxConcurrentRoutes: 1,
          renderAfterTime: 5000,
          headless: true,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        },
        // 렌더링 결과를 로그로 확인
        postProcess(renderedRoute) {
          console.log(`[PRE-RENDER] Captured: ${renderedRoute.route} (${renderedRoute.html.length} bytes)`);
          return renderedRoute;
        }
      })
    ]
  }
}
