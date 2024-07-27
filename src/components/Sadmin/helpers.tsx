import { BgColorsOutlined } from '@ant-design/icons';
import {
  MenuDataItem,
  ProBreadcrumb,
  ProColumns,
  ProFormCascader,
  ProFormColumnsType,
  ProRenderFieldPropsType,
  RouteContext,
  getMenuData,
} from '@ant-design/pro-components';
import { FormattedMessage, injectIntl, useIntl, useModel, useRouteData } from '@umijs/max';
import { ColorPicker, Image, Input } from 'antd';
import { get } from 'rc-util';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import DebounceSelect from './DebounceSelect';
import { ConfirmRender } from './action/confirm';
import { ConfirmFormRender } from './action/confirmForm';
import CustomerColumnRender from './action/customerColumn';
import CustomerColumnRenderDev from './action/customerColumn/dev';
import ModalJson from './action/modalJson';
import CarBrand from './carBrand';
import { isBool, isObj, isStr } from './checkers';
import { FormCalendarRender } from './formCalendar';
import { Guiges } from './guige';
import JsonEditor from './jsonEditor';
import JsonForm from './jsonForm';
import { TampShow, TmapInput } from './map/tmap';
import { ModalSelectRender } from './modalSelect';
import SaOptions, { SaEditorTable } from './options';
import { PcaRender, getPca } from './pca';
import PermGroup from './perm/group';
import UserPerm from './perm/user';
import { tableFromBreadRender } from './tableFromBread';
import TinyEditor from './tinyEditor';
import { SaTransferRender } from './transfer';
import Uploader from './uploader';
import AliyunVideo from './uploader/video';
import IconSelect, { iconToElement } from './valueTypeMap/iconSelect';
import MDEditor from './valueTypeMap/mdEditor';
import { wxMenuRender } from './wxMenu';
import { isString } from 'lodash';
import SaAutoCompleteMap from './valueTypeMap/autoComplete';
import { DropdownActionMap } from './valueTypeMap/dropdownAction';
import { ColorPickerMap } from './valueTypeMap/colorPicker';
import { BampShow, BmapInput } from './map/bmap';

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
      icon: icon && iconToElement(icon),
      routes: routes && loopMenuItem(routes),
    };
  });

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
  | 'pca'
  | 'permGroup'
  | 'userPerm'
  | 'debounceSelect'
  | 'jsonForm'
  | 'carBrand'
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
  | 'customerColumnDev'
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
>;
type saFormColumnsTypeFn<T> = (d: T) => saFormColumnsType;
export declare type saFormTabColumnsType = Array<{
  title?: string;
  formColumns?: saFormColumnsType | saFormColumnsTypeFn<any>;
}>;
export declare type saFormColumnsType = Array<saValueTypeMapType | saColumnsExtend | string>;
export declare type saTableColumnsType = Array<
  ProColumns | saValueTypeMapType | saColumnsExtend | string
>;
//只有table中渲染才有props.record form中渲染是没有record ,只有当前字段的数据信息
export const saValueTypeMap: Record<string, ProRenderFieldPropsType> = {
  uploader: {
    render: (image, props) => {
      if (typeof image != 'object') {
        image = image ? JSON.parse(image) : [];
      }
      const preview = image.map((file, index) => {
        const [url] = file.url.split('?');
        return url;
      });
      const type = props.fieldProps.type ? props.fieldProps.type : 'image';
      //console.log(image, props);
      return (
        <>
          {type == 'image' ? (
            <Image.PreviewGroup items={preview}>
              {image.map((file, index) => {
                if (!props.fieldProps.max || props.fieldProps.max >= index + 1) {
                  return (
                    <Image width={48} src={file.url} key={file.uid ? file.uid : Math.random()} />
                  );
                }
              })}
            </Image.PreviewGroup>
          ) : (
            image.map((file, index) => {
              if (!props.fieldProps.max || props.fieldProps.max >= index + 1) {
                return (
                  <a href={file.url} target="_blank">
                    {file.name}
                  </a>
                );
              }
            })
          )}
        </>
      );
    },
    renderFormItem: (text, props) => {
      return <Uploader {...props.fieldProps} />;
    },
  },
  aliyunVideo: {
    render: (image, props) => {
      return <>-</>; //列表默认不显示
    },
    renderFormItem: (text, props) => {
      //return null;
      return <AliyunVideo {...props.fieldProps} />;
    },
  },
  saFormTable: {
    render: (text) => {
      console.log('read only');
      return text;
    },
    renderFormItem: tableFromBreadRender,
  },
  wxMenu: {
    render: wxMenuRender,
    renderFormItem: wxMenuRender,
  },
  tinyEditor: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <TinyEditor {...props.fieldProps} />;
    },
  },
  guigePanel: {
    render: (text, props) => <Guiges {...props.fieldProps} />,
    renderFormItem: (text, props) => {
      return <Guiges {...props.fieldProps} />;
    },
  },
  saEditorTable: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <SaEditorTable {...props.fieldProps} />;
    },
  },
  jsonEditor: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <JsonEditor {...props.fieldProps} />;
    },
  },
  tmapInput: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <TmapInput {...props.fieldProps} />;
    },
  },
  tmapShow: {
    render: (text) => {
      console.log(text);
      if (isStr(text)) {
        text = text ? JSON.parse(text) : {};
      }
      return <TampShow {...text} />;
    },
  },
  bmapInput: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <BmapInput {...props.fieldProps} />;
    },
  },
  bmapShow: {
    render: (text) => {
      console.log(text);
      if (isStr(text)) {
        text = text ? JSON.parse(text) : {};
      }
      return <BampShow {...text} />;
    },
  },
  pca: {
    render: (text, props) => {
      //console.log('pca props', props);
      const { fieldProps } = props;
      return <PcaRender text={text} level={fieldProps.level} topcode={fieldProps.topCode} />;
    },
    renderFormItem: (text, props) => {
      //console.log('pca props', props, props?.fieldProps);
      // return <SaPcaRender {...props.fieldProps} />;
      const level = props.fieldProps.level ? props.fieldProps.level : 3;
      const topCode = props.fieldProps.topCode ? props.fieldProps.topCode : '';
      delete props.fieldProps.topCode;

      if (props.fieldProps.value) {
        if (isJsonString(props.fieldProps.value)) {
          props.fieldProps.value = JSON.parse(props.fieldProps.value);
        }
        if (Array.isArray(props.fieldProps.value)) {
          if (props.fieldProps.multiple) {
            //支持多选
            props.fieldProps.value = props.fieldProps.value.map((sv) => {
              return sv.map((v) => parseInt(v));
            });
          } else {
            props.fieldProps.value = props.fieldProps.value.map((v) => parseInt(v));
          }
        }
      }
      //console.log('pca props', props, topCode, props.fieldProps);
      return (
        <ProFormCascader
          noStyle
          {...props.fieldProps}
          fieldProps={{ ...props.fieldProps }}
          request={async () => {
            const data = await getPca(level, topCode);
            return data;
          }}
        />
      );
    },
  },
  permGroup: {
    renderFormItem: (text, props) => {
      // console.log('permGroup', props);
      return <PermGroup {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  debounceSelect: {
    renderFormItem: (text, props) => {
      //console.log('debounceSelect', props, 'text');
      return <DebounceSelect {...props.fieldProps} />;
    },
    render: (text) => {
      //console.log(text);
      return <span>{text?.label}</span>;
    },
  },
  jsonForm: {
    renderFormItem: (text, props) => {
      return <JsonForm {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  carBrand: {
    renderFormItem: (text, props) => {
      return <CarBrand {...props.fieldProps} />;
    },
  },
  link: {
    render: (link, props) => {
      if (isObj(link)) {
        return <Link to={link.href}>{link.title}</Link>;
      } else {
        const { fieldProps, record } = props;
        const { path, foreign_key, local_key } = fieldProps;
        if (path) {
          return (
            <Link to={path + '?' + foreign_key + '=' + (local_key ? record[local_key] : link)}>
              {link}
            </Link>
          );
        } else {
          return link;
        }
      }
    },
  },
  expre: {
    render: (_, props) => {
      if (!props.record) {
        props.record = _;
      }

      return tplComplie(props.fieldProps.exp, props);
      //console.log('expre', _, props);
      // const ExpRE = /^\s*\{\{([\s\S]*)\}\}\s*$/;
      // const matched = props.fieldProps.exp.match(ExpRE);
      // if (!matched) return _;

      // return new Function('$root', `with($root) { return (${matched[1]}); }`)(props);
    },
  },
  saFormList: {
    renderFormItem: (text, props) => {
      //console.log('out', props);
      const { fieldProps } = props;
      const name = fieldProps.dataindex ? fieldProps.dataindex : fieldProps.id;
      return (
        <SaOptions
          name={name}
          columns={props.columns}
          {...fieldProps}
          //itemprops={{ ...props }}
          //key={Math.random()}
          //initialValue={[...props.fieldProps.value]}
        />
      );
    },
    render: (text) => text,
  },
  //合并到customerColumn组件中使用
  confirm: {
    render: ConfirmRender,
  },
  //合并到customerColumn组件中使用
  confirmForm: {
    render: (_, props) => {
      return <ConfirmFormRender record={props.record} {...props.fieldProps} />;
    },
    renderFormItem: (_, props) => {
      return <ConfirmFormRender {...props.fieldProps} />;
    },
  },
  modalJson: {
    renderFormItem: (text, props) => {
      //console.log('props', props);
      return <ModalJson {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  userPerm: {
    render: (text, props) => {
      return <UserPerm dataId={props.record.id} {...props.fieldProps} />;
    },
  },
  modalSelect: {
    render: ModalSelectRender,
    renderFormItem: ModalSelectRender,
  },
  customerColumn: {
    render: (text, props) => {
      //console.log('customerColumn', text, props);
      const { fieldProps } = props;
      //const { items } = fieldProps;
      return (
        <CustomerColumnRender
          {...fieldProps}
          type={props.record ? 'table' : 'form'}
          record={props.record ? props.record : {}}
          text={text}
        />
      );
    },
    renderFormItem: (text, props) => {
      const { fieldProps } = props;
      //const { items } = fieldProps;
      //console.log('renderFormItem here');
      return <CustomerColumnRender {...fieldProps} type="form" record={{}} text={text} />;
    },
  },
  customerColumnDev: {
    renderFormItem: CustomerColumnRenderDev,
    render: CustomerColumnRenderDev,
  },
  formCalendar: {
    renderFormItem: FormCalendarRender,
    render: FormCalendarRender,
  },
  saTransfer: {
    render: SaTransferRender,
    renderFormItem: SaTransferRender,
  },
  html: {
    render: (text, props) => {
      return <div dangerouslySetInnerHTML={{ __html: text }}></div>;
    },
  },
  colorPicker: {
    render: (_, props) => {
      return <ColorPicker size="small" value={_} showText disabled />;
    },
    renderFormItem: ColorPickerMap,
  },
  mdEditor: {
    render: (_, props) => {
      return _;
    },
    renderFormItem: MDEditor,
  },
  iconSelect: {
    render: (_, props) => {
      return _;
    },
    renderFormItem: IconSelect,
  },
  saAutoComplete: {
    render: (_) => {
      return _;
    },
    renderFormItem: SaAutoCompleteMap,
  },
  dropdownAction: {
    render: DropdownActionMap,
    renderFormItem: DropdownActionMap,
  },
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
  const cpl = (exp: string) => {
    try {
      //检测是否有return
      if (exp.indexOf('return') > -1) {
        //console.log('has return', matched[1]);
        const fuc = ((body) => {
          return new Function(`return ${body}`)();
        })(exp);
        //console.log('func body is', fuc);
        return fuc({ ...props, t, intl });
      } else {
        return new Function('$root', `with($root) { return (${exp}); }`)({ ...props, t, intl });
      }
    } catch (e) {
      console.log('表达式错误，请' + +'重写', exp, props, e);
      return false;
    }
  };
  //使用func 只匹配一次，exp必须{{ 首尾有空格 }}
  const regex = func ? /^\s*\{\{([\s\S]*)\}\}\s*$/ : /{{\s*([^{}]*)\s*}}/g;

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

export function isJsonString(str) {
  try {
    const toObj = JSON.parse(str); // json字符串转对象
    /*
        判断条件 1. 排除null可能性 
                 2. 确保数据是对象或数组
    */
    if (toObj && typeof toObj === 'object') {
      return true;
    }
  } catch {}
  return false;
}

export const isDev = () => {
  const { initialState } = useModel('@@initialState');
  return initialState?.settings?.adminSetting?.dev;
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

export function search2Obj(unsetNames: string[]): { [key: string]: any } {
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
  const { items: bitem } = value?.breadcrumb;
  let items = bitem ? bitem : [];
  const bread = getBread(path);
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

export const getBread = (path: string) => {
  if (!path) {
    return null;
  }
  const { initialState } = useModel('@@initialState');
  //const { admin } = useContext(SaDevContext);
  const { breadcrumb } = getMenuData(initialState?.currentUser?.menuData);
  if (path == '/') {
    //首页默认跳转第一个菜单
    path = initialState?.currentUser?.menuData[0]?.path;
  }

  if (path.substring(0, 1) == '/') {
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
