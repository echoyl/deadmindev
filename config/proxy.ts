/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
/**
 * @name 开发环境代理的目标接口地址
 * @description 统一在此处配置，target 只能写到域名（协议 + host + 端口），
 * 不要带路径。请求路径由代理的匹配前缀（如 /sadmin/、/storage/）保留转发，
 * 若 target 带了路径会被 http-proxy-middleware 拼接到请求路径前面，导致 404。
 */
const DEV_TARGET = 'http://echoyl.la';

export default {
  dev: {
    // localhost:8000/sadmin/** -> http://tansuo.la/sadmin/**
    '/sadmin/': {
      // 要代理的地址
      target: DEV_TARGET,
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
    },
    // localhost:8000/storage/** -> http://tansuo.la/storage/**
    '/storage/': {
      // 要代理的地址
      target: DEV_TARGET,
      changeOrigin: true,
    },
    '/img/': {
      // 要代理的地址
      target: DEV_TARGET,
      changeOrigin: true,
    },
  },
  test: {
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
