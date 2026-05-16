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
 * 计算全屏高度需要剪掉的基础高度，不同类型的页面需要再计算自己的页面中组件的高度
 * @param settings 系统配置
 * @param pageType 如果是page表示可能存在底部版权内容
 */
export const fullPageHeight = (settings?: Record<string, any>, pageType: string = 'page') => {
  const footerHeight = !settings?.adminSetting?.tech && pageType == 'page' ? 0 : 38; //底部高度
  const headerHeight = 46; //头部高度
  const breadHeight = 43; //面包屑高度
  const pagePaddingBottom = 16; //页面底部padding
  return footerHeight + headerHeight + breadHeight + pagePaddingBottom;
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
