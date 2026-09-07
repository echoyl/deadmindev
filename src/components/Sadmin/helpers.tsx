import type {
  MenuDataItem,
  ProColumns,
  ProFormColumnsType,
  ProRenderFieldPropsType,
} from '@ant-design/pro-components';
import { ProBreadcrumb, RouteContext, getMenuData } from '@ant-design/pro-components';
import { FormattedMessage, useModel, useRouteData } from '@umijs/max';
import { isString } from 'es-toolkit';
import { get } from 'rc-util';
import React, { useContext } from 'react';
import { isStr } from './checkers';
import valueTypeMap from './valueTypeMap';
import devTypeMap from './valueTypeMap/dev';
import { iconToElement } from './valueTypeMap/iconSelect';

export function findParents(array, id, fieldNames = { id: 'id', children: 'child' }) {
  let parentArray = [];
  if (array.length === 0) {
    return parentArray;
  }

  function recursion(arrayNew, id) {
    for (let i = 0; i < arrayNew.length; i++) {
      let node = arrayNew[i];
      if (node[fieldNames.id] === id) {
        parentArray.unshift(node[fieldNames.id]);
        recursion(array, node.parent_id);
        break;
      } else {
        if (!!node[fieldNames.children]) {
          recursion(node[fieldNames.children], id);
        }
      }
    }
    return parentArray;
  }
  let arrayNew = array;
  parentArray = recursion(arrayNew, id);
  //console.log(parentArray,id);
  return parentArray;
}

export const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, routes, ...item }) => {
    //const msg = saFormattedMessage(item.name);
    const msg = tplComplie(item.name);
    // if (msg) {
    //   delete item.name;
    // }
    return {
      ...item,
      name: msg,
      icon: icon && iconToElement(icon as string, {}),
      routes: routes && loopMenuItem(routes),
    };
  });

/**
 * 将菜单进行国际化处理
 * @param menus
 * @returns
 */
export const loopMenuLocale = (
  menus: Record<string, any>[],
  fieldNames = { children: 'children' },
): any[] => {
  return menus?.map(({ [fieldNames.children]: children, ...item }) => {
    const msg = tplComplie(item.label);
    const ret: Record<string, any> = {
      ...item,
      title: msg,
      label: msg,
    };
    if (children && children.length > 0) {
      ret[fieldNames.children] = loopMenuLocale(children, fieldNames);
    }

    return ret;
  });
};

declare type saColumnsExtend = {
  requestParam?: { url?: string; params?: object };
  requestDataName?: string;
  valueEnumDataName?: string;
  columns?: saFormColumnsType;
};
export declare type saValueTypeMapType<T = any, ValueType = 'text'> = ProFormColumnsType<
  T,
  | ValueType
  | 'uploader'
  | 'tinyEditor'
  | 'saEditorTable'
  | 'jsonEditor'
  | 'tmapInput'
  | 'tmapShow'
  | 'bmapInput'
  | 'bmapShow'
  | 'mapInput'
  | 'mapShow'
  | 'pca'
  | 'permGroup'
  | 'debounceSelect'
  | 'searchSelect'
  | 'jsonForm'
  | 'link'
  | 'saFormList'
  | 'saFormTable'
  | 'guigePanel'
  | 'expre'
  | 'confirm'
  | 'modalJson'
  | 'confirmForm'
  | 'modalSelect'
  | 'customerColumn'
  | 'cdependency'
  | 'wxMenu'
  | 'formCalendar'
  | 'aliyunVideo'
  | 'saTransfer'
  | 'html'
  | 'colorPicker'
  | 'mdEditor'
  | 'iconSelect'
  | 'dropdownAction'
  | 'saSlider'
  | 'alert'
  | 'radioSegmented'
  | 'menuSelect'
  | 'modelSelect'
  | 'devColumnSelect'
  | 'devColumnTreeSelect'
  | 'devColumnRelationSelect'
>;
type saFormColumnsTypeFn<T> = (d: T) => saFormColumnsType;
export declare type saFormTabColumnsType = {
  title?: string;
  tab?: { title?: string; [key: string]: any };
  formColumns?: saFormColumnsType | saFormColumnsTypeFn<any>;
}[];
export declare type saFormColumnsType = (saValueTypeMapType | saColumnsExtend | string)[];
export declare type saTableColumnsType = (
  | ProColumns
  | saValueTypeMapType
  | saColumnsExtend
  | string
)[];
//只有table中渲染才有props.record form中渲染是没有record ,只有当前字段的数据信息
export const saValueTypeMap: Record<string, ProRenderFieldPropsType> = {
  ...valueTypeMap,
  ...devTypeMap,
};
export const t = (id?: string, intl?: any) => {
  //if(!id)return;
  return intl ? (
    intl.formatMessage({
      id,
    })
  ) : (
    <FormattedMessage id={id} key={id} />
  );
};
export const tplComplie = (exp: string | undefined, props: any = {}) => {
  if (!exp) {
    return false;
  }
  if (!isString(exp)) {
    return exp;
  }
  const { intl, func } = props;
  const t = (id: string) => {
    const msg = intl ? (
      intl.formatMessage({
        id,
      })
    ) : (
      <FormattedMessage id={id} key={id} />
    );
    return msg;
  };
  const cpl = (exp2: string) => {
    try {
      //检测是否有return
      if (exp2.indexOf('return') > -1) {
        //console.log('has return', matched[1]);
        const fuc = ((body) => {
          return new Function(`return ${body}`)();
        })(exp2);
        //console.log('func body is', fuc);
        return fuc({ ...props, t, intl });
      } else {
        return new Function('$root', `with($root) { return (${exp2}); }`)({ ...props, t, intl });
      }
    } catch (e) {
      console.log('表达式错误，请重写', exp2, props, e);
      return false;
    }
  };
  //使用func 只匹配一次，exp必须{{ 首尾有空格 }}
  //检测是否是func
  const is_func = exp.substring(0, 4) == 'func' ? true : false;

  if (is_func) {
    exp = exp.substring(4);
  }

  const regex = func || is_func ? /^\s*\{\{([\s\S]*)\}\}\s*$/ : /{{\s*([^{}]*)\s*}}/g;

  // 使用数组的map方法来处理字符串，避免使用dangerouslySetInnerHTML
  const renderedTemplate = exp
    .split(regex)
    .map((part, index) => {
      if (index % 2 === 0) {
        // 偶数索引是模板的普通文本部分
        return part;
      } else {
        // 奇数索引是组件占位符
        return part ? cpl(part) : false;
      }
    })
    .filter((v) => v !== '');
  //检测结果中是否有 dom
  const element = renderedTemplate.filter((v) => {
    return React.isValidElement(v);
  });
  //console.log('element', renderedTemplate, element);
  if (element.length > 0) {
    //有dom
    return <>{renderedTemplate}</>;
  } else {
    return renderedTemplate.length == 1 ? renderedTemplate[0] : renderedTemplate.join('');
  }
};

export const stateSwitchProps = {
  checkedChildren: '开启',
  unCheckedChildren: '关闭',
  defaultChecked: true,
};

export const boolSwitchProps = {
  checkedChildren: '是',
  unCheckedChildren: '否',
};

export const shenheSwitchProps = {
  checkedChildren: '审核通过',
  unCheckedChildren: '审核中',
};

export function log(...data: any) {
  console.log(data);
}

export const getFromObject = (record, dataIndex) => {
  if (!record) {
    return undefined;
  }
  const value = Array.isArray(dataIndex) ? get(record, dataIndex) : record[dataIndex];
  return value;
};

export function search2Obj(unsetNames: string[] = []): { [key: string]: any } {
  let search = window.location.search;
  if (search) {
    //console.log('search is', decodeURIComponent(search));
    search = decodeURIComponent(search);
    let search_arr: { [key: string]: any } = {};
    search
      .substring(1)
      .split('&')
      .forEach((v) => {
        let [key, val] = v.split('=');
        if (!unsetNames?.includes(key)) {
          search_arr[key] = val;
        }
      });

    return search_arr;
    //return parse(search);
  }
  return {};
}

let IDX = 36,
  HEX = '';
while (IDX--) HEX += IDX.toString(36);
export function uid(len?: number) {
  let str = '',
    num = len || 11;
  while (num--) str += HEX[(Math.random() * 36) | 0];
  return str;
}
export const SaBreadcrumbRender = (props) => {
  const { match = false, path } = props;
  const detail = match ? [{ title: '详情' }] : [];
  const value = useContext(RouteContext);
  const { route } = useRouteData();
  const { initialState } = useModel('@@initialState');
  const { items: bitem } = value?.breadcrumb;
  let items = bitem ? bitem : [];
  const bread = getBread(path, initialState?.currentUser);
  if (!bitem) {
    //没有的话 读取
    if (bread?.data?.names) {
      items = bread?.data?.names;
    } else {
      //还是没有的话读取匹配的路由的name信息
      if (route.name) {
        items = [{ title: route.name }];
      } else {
        items = [{ title: bread?.name }];
      }
    }
  }
  const _items = [...items, ...detail];
  //最外层菜单去除链接
  // _items.map((v, k) => {
  //   if (k < items.length - 1) {
  //     v.linkPath = '';
  //   }
  // });
  return <ProBreadcrumb items={_items} />;
};

export const getBread = (path: string, currentUser?: Record<string, any>) => {
  if (!path || !currentUser?.menuData) {
    return null;
  }
  const { breadcrumb } = getMenuData(currentUser?.menuData);
  if (path == '/') {
    //首页默认跳转第一个菜单
    if (currentUser?.redirect && currentUser?.redirect != path) {
      path = currentUser?.redirect;
    } else {
      //读取第一个非hideInMenu的菜单
      const firstShowMenu = currentUser?.menuData?.find((v) => !v.hideInMenu);
      path = firstShowMenu?.path;
    }
  }

  if (isStr(path) && path.substring(0, 1) == '/') {
    path = path.substring(1);
  }
  if (breadcrumb['/' + path]) {
    return breadcrumb['/' + path];
  }
  return null;
};
const findChild = (data, id) => {
  let r;
  for (const v of data) {
    if (v.id == id) {
      r = v;
    } else {
      if (v.routes?.length > 0) {
        r = findChild(v.routes, id);
      }
    }
    if (r) {
      break;
    }
  }
  return r;
};
export const getMenuDataById = (data, id) => {
  //const { initialState } = useModel('@@initialState');
  const menu = findChild(data, id);
  return menu;
};

export const parseIcon = (icon) => {
  if (icon) {
    if (isStr(icon)) {
      return iconToElement(icon);
    } else {
      return icon;
    }
  }
  return null;
};
