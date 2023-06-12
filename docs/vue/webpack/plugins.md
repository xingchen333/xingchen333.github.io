# 针对部分插件打包目录出现问题：尝试filename: 'static/js/[name].hash.js' 解决

monaco编辑器不做设置的情况下会将worker.js编译至/dist下，这里可以让代码正确编译到/static/js下

vue.config.js(webpack config.js)
``` js
'use strict'
const webpack = require('webpack') 
const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 3000 npm run dev OR npm run dev --port = 3000
const port = process.env.port || process.env.npm_config_port || 3000 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  // lintOnSave: process.env.NODE_ENV === 'development',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    // before: require('./mock/mock-server.js'),
    // 接口转发
    proxy: {}
    }
  },

  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src'),
        'static': resolve('static') // 增加这一行代码
      }
    },
    plugins: [
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['javascript', 'css', 'html', 'typescript', 'json', 'java', 'sql'],
        filename: 'static/js/[name].[hash].worker.js',
        publicPath: '../'
      }),
      new webpack.ProvidePlugin({
        'window.Quill': 'quill',
        'Quill': 'quill/dist/quill.js'
      })
    ]
  },
  chainWebpack(config) {
    //config. xxx
  }
}
```