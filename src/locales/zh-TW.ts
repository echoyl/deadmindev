import component from './zh-TW/component';
import globalHeader from './zh-TW/globalHeader';
import menu from './zh-TW/menu';
import pages from './zh-TW/pages';
import pwa from './zh-TW/pwa';
import settingDrawer from './zh-TW/settingDrawer';
import settings from './zh-TW/settings';

export default {
  'navBar.lang': '語言',
  'layout.user.link.help': '幫助',
  'layout.user.link.privacy': '隱私',
  'layout.user.link.terms': '條款',
  'app.preview.down.block': '下載此頁面到本地項目',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
  cancel: '取消',
  view: '查看',
  edit: '編輯',
  add: '新增',
  delete: '刪除',
  addchild: '添加子級',
  all: '全部',
};
