// const { defineConfig } = require('@vue/cli-service');

// module.exports = defineConfig({
//   transpileDependencies: [
//     'vuetify'
//   ],
//   devServer: {
//     https: true,
//     historyApiFallback: true,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3400',
//         changeOrigin: true,
//         pathRewrite: {
//           '^/api': ''
//         }
//       }
//     }
//   }
// });

const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  devServer: {
    open: true,
    historyApiFallback: true,
  },
});
