import dayjs from 'dayjs';
import { isArr } from '../checkers';
import { tplComplie } from '../helpers';

export const urlAddQuery = (url: string, query?: Record<string, string>) => {
  const urlObj = new URL(url);
  for (var key in query) {
    urlObj.searchParams.append(key, query[key]);
  }
  return urlObj.toString();
};

export const tplToDate = (tpl: string | Array<string>) => {
  if (isArr(tpl)) {
    tpl = tpl.map((iv) => {
      const _iv = tplComplie(iv, { dayjs });
      return _iv;
    });
  } else {
    tpl = tplComplie(tpl, { dayjs });
  }
  return tpl;
};
