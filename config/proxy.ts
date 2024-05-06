/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export const baseurl = '/antadmin/';
export default {
  dev: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/sadmin/': {
      // 要代理的地址
      //target: 'http://wxapp.la/ganchangzichan/public',
      //target: 'http://wangzhan.la/jiangxichuangtou/public',
      //target: 'http://wx.la/huayuan/public',
      //target: 'http://wangzhan.la/pro/public',
      //target: 'http://wxapp.la/ganchangshangcheng/public',
      target: 'http://echoyl.la',
      //target: 'http://wangzhan.la/hzjt6666/public',
      //target: 'http://wxapp.la/anjiwuliu/public',
      //target: 'http://wxapp.la/lvyouziyuanpucha/public',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
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
