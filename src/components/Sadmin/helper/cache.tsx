import localforage from 'localforage';

const cache = {
  get: async (
    key: string,
    defaultValue: any = null,
    callback?: (err: any, value: any | null) => void,
  ) => {
    const data = await localforage.getItem(key, callback);

    if (!data) {
      return defaultValue;
    }

    const { expire, value } = data;

    if (expire > 0 && expire < Date.now()) {
      localforage.removeItem(key);
      return defaultValue;
    }
    return value;
  },
  set: (key: string, value: any, expirems?: number, callback?: (err: any, value: any) => void) => {
    const expire = expirems ? Math.round(expirems * 1000 + Date.now()) : -1;
    return localforage.setItem(key, { value, expire }, callback);
  },
  remove: localforage.removeItem,
  clear: localforage.clear,
  keys: localforage.keys,
};

export default cache;
