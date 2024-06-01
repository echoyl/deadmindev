// @ts-ignore
/* eslint-disable */
import cache from '@/components/Sadmin/helper/cache';
import { message, notification } from '@/components/Sadmin/message';
import { history, request as orequest } from '@umijs/max';
import { extend } from 'umi-request';
const codeMessage: { [key: string]: any } = {};

export const request_prefix = '/sadmin/';

export const loginPath = '/login';

export const adminTokenName = 'sadmin-token';

export const rememberName = 'Sa-Remember';

export const settingName = 'adminSetting';

export const messageLoadingKey = 'message_loading_key';

function errorHandler(error) {
  // 请求已发送但服务端返回状态码非 2xx 的响应
  //console.log(typeof error, JSON.stringify(error), error);
  if (error.data) {
    const { status, statusText, message } = error.data;
    const description = message || codeMessage[status] || statusText;
    notification?.error?.({
      message: '提示',
      description: description,
    });
    // 请求初始化时出错或者没有响应返回的异常
  } else {
    const description = error.message || error.errDesc || '系统异常';
    if (description != 'error') {
      notification?.error?.({ description, message: '提示' });
    }
  }
  throw new Error();
}

export async function getAdminToken() {
  const adminToken = await cache.get(adminTokenName);
  return adminToken;
}

export async function setAdminToken(data: string) {
  return cache.set(adminTokenName, data);
}

const request = extend({ errorHandler });
export async function requestHeaders() {
  const token = await getAdminToken();
  const remember = await cache.get(rememberName);
  return {
    Authorization: `Bearer ${token}`,
    'Sa-Remember': remember,
    'X-Requested-With': 'XMLHttpRequest',
  };
}

export function getFullUrl(url: string) {
  return request_prefix + url;
}

request.interceptors.request.use(async (url, options) => {
  const { headers } = options;
  const contentType = {
    'Content-Type': 'application/json',
  };
  const rheaders = await requestHeaders();
  return {
    url: getFullUrl(url),
    options: {
      ...options,
      headers: { ...headers, ...contentType, ...rheaders },
    },
  };
});

export const responseCodeAction = (code: number, method: string, drawer: boolean) => {
  //登录失效
  //const baseurl = process.env.NODE_ENV === 'production' ? './' : '/';
  if (code == 1001) {
    // if (window.location.pathname.replace(baseurl, '/') == loginPath) {
    //   return true;
    // }

    const gourl = loginPath + '?redirect=' + history.location.pathname;
    console.log('gourl', gourl);
    history.push(gourl);
    return true;
  } else if (code == 401301) {
    //这里检测 是post还是get post传数据的话 不跳转页面。
    //如果设置了drawer参数 get方式也是不会跳转页面的 示例，当打开一个form时 post和get都指向一个路由 都没有权限的话 会有不用跳转页面的需求
    if (method == 'GET' && !drawer) {
      history.push('/403');
      console.log('noauth go push');
      return true;
    }
  }
  return false;
};
request.interceptors.request.use(async (response, options) => {
  const { showLoading } = options;
  if (showLoading) {
    message.loading({ content: 'Loading...', duration: 0, key: messageLoadingKey });
  }
});
request.interceptors.response.use(async (response, options) => {
  const res = await response.clone().json();
  //console.log('res', res);
  const { code, msg, data } = res;
  if (code) {
    //message.error(msg);
    if (responseCodeAction(code, options.method as string, options.drawer)) {
      return false;
    }
  }

  if (options.then) {
    //自定义接管之后的操作设置
    options.then({ code, msg, data, res });
  } else {
    //默认的操作设置
    if (code) {
      notification.error({ description: msg, message: '提示' });
      options.msgcls && options.msgcls({ code, msg, data, res });
    } else {
      if (msg) {
        if (options.method == 'POST' || options.method == 'DELETE') {
          // notification.info({
          //   message: '提示',
          //   description: msg,
          //   duration: 3,
          // });
          message.success({
            key: messageLoadingKey,
            content: msg,
            duration: 1,
          });
          if (data?.logout) {
            message.loading({
              content: '退出登录中...',
              duration: 0,
              key: messageLoadingKey,
            });
            await loginOut(() => {
              message.destroy(messageLoadingKey);
            });
          } else {
            options.msgcls && options.msgcls({ code, msg, data, res });
          }
        } else {
          options.msgcls && options.msgcls({ code, msg, data, res });
        }
        //添加导出跳转下载页面功能
        if (data?.download) {
          const a = document.createElement('a');
          a.target = '_blank';
          a.download = data.download;
          a.href = data.url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    }
  }

  return response;
});

export default request;

export async function saUpload(data?: { [key: string]: any }) {
  //const method = options?.method;
  //console.log(data);
  return request.post('uploader/index', {
    data: data,
    requestType: 'form',
  });
}

export async function captcha(options?: { [key: string]: any }) {
  return request.get('captcha', { params: options });
}

export async function currentUser(options?: { [key: string]: any }) {
  return request.get('currentUser');
}

export async function loginOut(cb?: Function) {
  return request.get('index/logout', {
    msgcls: () => {
      //删除数据 token
      cache.remove(adminTokenName);
      cache.remove(settingName);
      cache.keys((err, keys) => {
        if (!err) {
          keys.map((k) => {
            if (k.indexOf('pca') >= 0) {
              cache.remove(k);
            }
          });
        }
      });

      if (cb) {
        cb();
      }

      history.push({
        pathname: loginPath,
        search: '?redirect=' + history.location.pathname,
      });
      return;
    },
  });
}
