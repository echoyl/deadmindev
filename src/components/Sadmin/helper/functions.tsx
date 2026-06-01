import dayjs from 'dayjs';
import { isArr, isObj, isUndefined } from '../checkers';
import { tplComplie } from '../helpers';

export const urlAddQuery = (url: string, query?: Record<string, string>) => {
  const urlObj = new URL(url);
  for (const key in query) {
    urlObj.searchParams.append(key, query[key]);
  }
  return urlObj.toString();
};

export const tplToDate = (tpl: string | string[]) => {
  if (isArr(tpl)) {
    return tpl.map((iv) => {
      const _iv = tplComplie(iv, { dayjs });
      return _iv;
    });
  } else {
    return tplComplie(tpl, { dayjs });
  }
};

export const columnHasSearch = (column: Record<string, any>) => {
  return (
    isObj(column) &&
    (isUndefined(column.search) || column.search) &&
    !['displayorder', 'option'].includes(column.valueType)
  );
};
export const hasSearch = (items: any[]) => {
  return items?.some((v) => columnHasSearch(v));
};

/**
 * 获取头部高度
 * @param fixedHeader 面包屑是否固定在顶部，如果固定则需要加上面包屑的高度
 * @returns
 */
export const pageTopHeight = (fixedHeader = true) => {
  const headerHeight = 46; //头部高度
  const breadHeight = 43; //面包屑高度
  return headerHeight + (fixedHeader ? breadHeight : 0);
};

/**
 * 计算全屏高度需要剪掉的基础高度，不同类型的页面需要再计算自己的页面中组件的高度
 * @param settings 系统配置
 * @param pageType 如果是page表示可能存在底部版权内容
 */
export const fullPageHeight = (settings?: Record<string, any>, pageType: string = 'page') => {
  const footerHeight = !settings?.adminSetting?.tech && pageType == 'page' ? 0 : 38; //底部高度
  const pagePaddingBottom = 16; //页面底部padding
  return footerHeight + pageTopHeight() + pagePaddingBottom;
};

//读取data中第一个没有children的元素信息
export const getFirstChild: (
  data: Record<string, any>[],
  childrenName?: string,
) => Record<string, any> | null = (
  data: Record<string, any>[],
  childrenName: string = 'children',
) => {
  if (data.length > 0) {
    const first = data[0];
    if (first[childrenName] && first[childrenName].length > 0) {
      return getFirstChild(first[childrenName]);
    } else {
      return first;
    }
  } else {
    return null;
  }
};

/**
 * 判断url是否是 ./ 相对路径开头，如果是的话拼接prefix
 * @param prefix
 * @param url
 */
export const fixUrlWithPrefix = (prefix: string | undefined, url: string) => {
  if (!prefix || !url) {
    return url;
  }
  if (url.startsWith('./')) {
    let normalizedPrefix = prefix;
    //检测prefix是否以/结尾，如果是去掉后 将prefix和url使用/拼接
    if (prefix.endsWith('/')) {
      normalizedPrefix = prefix.substring(0, prefix.length - 1);
    }
    const sub_url = url.substring(2);
    if (!sub_url) {
      return normalizedPrefix;
    }
    return [normalizedPrefix, sub_url].join('/');
  } else {
    return url;
  }
};
