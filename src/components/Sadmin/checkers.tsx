import { isUrl } from "@ant-design/pro-components";

const toString = Object.prototype.toString;
const isType =
  <T,>(type: string | string[]) =>
  (obj: unknown): obj is T =>
    getType(obj) === `[object ${type}]`;
export const getType = (obj: any) => toString.call(obj);
export const isFn = (val: any): val is Function => typeof val === 'function';
export const isUndefined = (val: any) => typeof val == 'undefined';
export const isArr = Array.isArray;
export const isPlainObj = isType<object>('Object');
export const isStr = isType<string>('String');
export const isBool = isType<boolean>('Boolean');
export const isNum = isType<number>('Number');
export const isMap = (val: any): val is Map<any, any> => val && val instanceof Map;
export const isSet = (val: any): val is Set<any> => val && val instanceof Set;
export const isWeakMap = (val: any): val is WeakMap<any, any> => val && val instanceof WeakMap;
export const isWeakSet = (val: any): val is WeakSet<any> => val && val instanceof WeakSet;
export const isNumberLike = (index: any): index is number => isNum(index) || /^\d+$/.test(index);
export const isObj = (val: unknown): val is object => typeof val === 'object';
export const isRegExp = isType<RegExp>('RegExp');
export const isReactElement = (obj: any): boolean => obj && obj['$$typeof'] && obj['_owner'];
export const isHTMLElement = (target: any): target is EventTarget => {
  return Object.prototype.toString.call(target).indexOf('HTML') > -1;
};
export const inArray = (find: any, arr: any) => {
  if (!isArr(arr)) {
    return -1;
  }
  return arr.findIndex((v) => {
    if (isArr(v)) {
      //元素是数组的话 json后对比下
      return JSON.stringify(find) == JSON.stringify(v);
    } else {
      return find == v;
    }
  });
};
export type Subscriber<S> = (payload: S) => void;

export interface Subscription<S> {
  notify?: (payload: S) => void | boolean;
  filter?: (payload: S) => any;
}

export const getJson = (jsonStr: any, defaultValue: any = []) => {
  if (isObj(jsonStr)) {
    return jsonStr;
  }

  if (!isStr(jsonStr)) {
    return defaultValue;
  }

  try {
    const val = jsonStr ? JSON.parse(jsonStr) : defaultValue;
    return val;
  } catch (e) {
    //console.log('json format is valid return default value', defaultValue);
    return defaultValue;
  }
};

export const isHttpLink = (url: string) => {
  return isUrl(url);
};
