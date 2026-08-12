import type { IApi } from 'umi';

export default (api: IApi) => {
  //将 loading.js 从 body 末尾（umi.js 之后）移到 umi.js 之前，即 <div id="root"></div> 之后
  api.modifyHTML(($) => {
    const loading = $('script[src*="loading.js"]');
    const umi = $('script[src*="/umi."]');
    if (!loading.length || !umi.length) return $;
    //序列化 loading 标签后移除，再以带换行的文本插到 umi.js 前，避免与 umi.js 挤在一行
    const loadingTag = $.html(loading);
    loading.remove();
    umi.before(loadingTag + '\n');
    //loading 原位置残留的换行会形成尾部多余空行，统一收敛为单个换行
    const bodyHtml = $('body').html() || '';
    $('body').html(bodyHtml.replace(/\n+$/, '\n'));
    return $;
  });
};
