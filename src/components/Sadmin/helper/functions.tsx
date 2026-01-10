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
