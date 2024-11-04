export const urlAddQuery = (url: string, query?: Record<string, string>) => {
  const urlObj = new URL(url);
  for (var key in query) {
    urlObj.searchParams.append(key, query[key]);
  }
  return urlObj.toString();
};
