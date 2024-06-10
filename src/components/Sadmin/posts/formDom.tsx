import request from '@/components/Sadmin/lib/request';
import { BetaSchemaForm, ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { cloneDeep, isString } from 'lodash';
import React, { ReactNode } from 'react';
import { inArray, isArr, isStr } from '../checkers';
import { FormColumnTitle } from '../dev/table/title';
import { getFromObject, getMenuDataById, saFormColumnsType, tplComplie } from '../helpers';
export const defaultColumnsLabel = {
  id: '序号',
  category_id: '分类选择',
  displayorder: '排序',
  state: '状态',
  option: '操作',
  coption: '操作',
};

const unsetReadonlyKey = (data: Record<string, any>, cls: any[]) => {
  cls.map((v) => {
    if (v.valueType == 'group') {
      unsetReadonlyKey(data, v.columns);
    } else {
      if (v.readonly === true) {
        if (Array.isArray(v.dataIndex)) {
          delete data[v.dataIndex[0]];
        } else {
          delete data[v.dataIndex];
        }
      }
    }
  });
};

export const beforePost = (data: Record<string, any>, formColumns: any[]) => {
  //console.log(formColumns, data);
  unsetReadonlyKey(data, formColumns);
};
export const beforeGet = (data: Record<string, any>) => {};

interface formFieldsProps {
  formColumnsIndex?: string[];
  labels?: Record<string, any>;
  detail?: Record<string, any>;
  columns?: ReactNode | ((value: any) => void);
  enums?: Record<string, any>;
  initRequest?: boolean;
  user?: any; //后台用户信息
  formRef?: ProFormInstance;
  devEnable?: boolean;
}

export const GetFormFields: React.FC<{
  columns: ProFormColumnsType[] | saFormColumnsType;
  grid?: boolean;
}> = ({ columns, grid = false }) => {
  //console.log('GetFormFields', columns);
  return <BetaSchemaForm layoutType="Embed" grid={grid} columns={columns} />;
};

export const getFormFieldColumns = (props: formFieldsProps) => {
  const {
    labels = {},
    detail = {},
    columns = [],
    enums = {},
    initRequest = false,
    user,
    devEnable = true,
    intl,
  } = props;
  if (!initRequest) return [];
  const allLabels = { ...defaultColumnsLabel, ...labels };

  //console.log('inner detail', detail);
  const customerColumns =
    typeof columns == 'function' ? columns(detail) : isArr(columns) ? cloneDeep(columns) : [];
  //console.log(detail);
  //const { initialState } = useModel('@@initialState');

  const defaulColumns: { [key: string]: any } = {
    id: {
      dataIndex: 'id',
      formItemProps: { hidden: true },
    },
    parent_id: {
      dataIndex: 'parent_id',
      formItemProps: { hidden: true },
    },
  };
  const checkCondition = (vals: { [key: string]: any }, dependency: { [key: string]: any }) => {
    let ret = true;
    const { condition = [], condition_type = 'all' } = dependency;
    for (var i in condition) {
      let cd = condition[i];
      let cname = cd.cname ? cd.cname.split('.') : cd.name;
      let cvalue = cd.value;

      if (cd.exp) {
        //有表达式优先检测表达式
        ret = tplComplie(cd.exp, {
          record: vals,
          user,
        });
      } else {
        let rvalue = getFromObject(vals, cname);
        if (!isStr(cvalue) || cvalue?.indexOf(',') < 0) {
          ret = rvalue == cvalue;
        } else {
          ret = inArray(rvalue, cvalue.split(',')) >= 0;
        }
      }
      if (condition_type == 'one') {
        //任一满足
        if (ret) {
          //一项不符合的话 直接返回错误
          return true;
        }
      } else {
        //全部满足
        if (!ret) {
          //一项不符合的话 直接返回错误
          return false;
        }
      }
    }

    return condition_type == 'all' ? true : false;
  };
  const parseColumns = (v, deep = 0) => {
    if (typeof v == 'string') {
      if (defaulColumns[v]) {
        //console.log(defaulColumns[c]);
        return { ...defaulColumns[v] };
      }
    } else {
      //加入if条件控制
      if (v.fieldProps?.if && !devEnable) {
        const show = tplComplie(v.fieldProps?.if, {
          record: detail,
          user,
        });
        //console.log('v.fieldProps?.if', v.fieldProps?.if, show);
        if (!show) {
          return false;
        }
      }

      if (v.requestParam) {
        v.request = async () => {
          const { data } = await request.get(v.requestParam.url, { params: v.requestParam.params });
          return data;
        };
      }
      const requestName = v.requestDataName
        ? v.requestDataName
        : v.fieldProps?.requestDataName
          ? v.fieldProps.requestDataName
          : false;
      if (requestName) {
        // v.request = async () => {
        //   return enums[v.requestDataName] ? enums[v.requestDataName] : detail[v.requestDataName];
        // };
        let options = [];
        if (isArr(requestName)) {
          //数组只从详情中获取
          options = getFromObject(detail, requestName);
        } else {
          options = enums?.[requestName] ? enums[requestName] : detail?.[requestName];
        }

        //console.log('has requestName is', requestName, enums, detail, options);
        v.fieldProps = {
          ...v.fieldProps,
          options: options ? options : [],
        };
        delete v.fieldProps.requestDataName;
      }

      if (v.fieldProps?.requestNames) {
        //将请求返回的数据赋值到formitem中的fieldProps配置中
        v.fieldProps.requestNames.forEach((name) => {
          const requestData = enums[name] ? enums[name] : detail[name];
          if (requestData) {
            v.fieldProps[name] = requestData;
          }
        });
      }

      //将name设置到属性当中 因为 valueTypeMap 中会丢失name 先在这里添加修改下
      v.fieldProps = { ...v.fieldProps, dataindex: v.dataIndex, olddataindex: v.dataIndex };
      if (v.valueType == 'modalSelect' && !v.fieldProps.name) {
        //将name设置到属性当中 因为 valueTypeMap 中会丢失name 先在这里添加修改下
        v.fieldProps = { ...v.fieldProps, name: v.dataIndex };
      }

      let columnsFun;
      if (isString(v.columns)) {
        columnsFun = ((body) => {
          return new Function(`return ${body}`)();
        })(v.columns);
        //console.log('columns is now', v.columns);
      }
      if (v.valueType == 'cdependency') {
        v.valueType = 'dependency';
        if (columnsFun) {
          v.columns = columnsFun;
        }
        //dependency不需要 title 和 dataindex
        delete v.title;
        delete v.dataIndex;

        //console.log('cdependency', v);
      }
      //支持 dependencyOn 控制表单项的显示隐藏
      if (v.dependencyOn) {
        //console.log('v.dependencyOn', v.dependencyOn);
        //console.log('cdependency', v);
        //将数据设置为dependency
        const dependencyOn = v.dependencyOn;
        const names = dependencyOn?.condition?.map((cv) => {
          return cv.cname ? cv.cname.split('.') : cv.name;
        });
        //delete v.dependencyOn;
        //克隆变量

        if (dependencyOn.type == 'render') {
          if (v.valueType == 'dependency' || !v.valueType) {
            v.name = names;
            v.valueType = 'dependency';
            // ((body) => {
            //   return new Function(`return ${body}`)();
            // })(new_column.columns);

            if (devEnable) {
              v = {
                valueType: 'dependency',
                name: names,
                columns: (d) => {
                  const relcol = columnsFun?.(d);
                  return relcol?.map((nv) => {
                    nv.title = <FormColumnTitle title={nv.title} uid={v.uid} />;
                    return nv;
                  });
                },
              };
            } else {
              if (columnsFun) {
                v.columns = columnsFun;
              }
            }
          } else {
            v.dependencies = names;
          }

          //v.valueType = 'dependency';
        } else {
          const new_column = JSON.parse(JSON.stringify(v));
          v = {
            valueType: 'dependency',
            name: names,
            columns: (dependencyOnName: string[]) => {
              //检测条件是否符合 condition 全部符合才返回数据
              if (checkCondition(dependencyOnName, dependencyOn) || devEnable) {
                return [new_column].map((nv) => {
                  if (devEnable && deep <= 1) {
                    if (!React.isValidElement(nv.title)) {
                      nv.title = <FormColumnTitle {...nv} />;
                    }
                  }
                  nv.dependencies = names;
                  //将依赖的字段值注入到fieldProps这样组件可以获取该依赖数据
                  if (nv.fieldProps?.placeholder) {
                    nv.fieldProps.placeholder = tplComplie(nv.fieldProps.placeholder, { intl });
                  }
                  nv.fieldProps = { ...nv.fieldProps, ...dependencyOnName };
                  return nv;
                });
              } else {
                return [];
              }
            },
          };
        }
      }
      //支持日期中的presets的value的字符串格式日期
      if (v.fieldProps?.presets) {
        //console.log('presets is', v);
        v.fieldProps.presets = v.fieldProps.presets.map((val) => {
          val.value = val.value.map((_v) => {
            if (isStr(_v)) {
              _v = dayjs(_v);
            }
            return _v;
          });
          return val;
        });
      }
      if (v.fieldProps?.showTime?.defaultValue) {
        //console.log('presets is', v);
        if (isArr(v.fieldProps.showTime.defaultValue)) {
          v.fieldProps.showTime.defaultValue = v.fieldProps.showTime.defaultValue.map((val) => {
            if (isArr(val)) {
              return dayjs(val[0], val[1]);
            } else {
              return dayjs(val, 'HH:mm:ss');
            }
          });
          console.log('showTime is', v);
        }
      }
      if (v.valueType == 'dateRange' || v.valueType == 'date') {
        if (v.fieldProps?.defaultValue) {
          v.fieldProps.defaultValue = v.fieldProps?.defaultValue?.map((val) => {
            if (isArr(val)) {
              return dayjs(val[0], val[1]);
            } else {
              return dayjs(val);
            }
          });
        }
      }

      //关联page检测
      if (v.page) {
        const relateMenu = getMenuDataById(user?.menuData, v.page);
        if (relateMenu) {
          v.columns = relateMenu.data.formColumns
            ? relateMenu.data.formColumns
            : relateMenu.data.tabs[0]?.formColumns;
        }
      } else {
        //如果时formlist 没有page 且没有columns 默认给一个 防止无属性不渲染dom
        if (v.valueType == 'formList' && !v.columns) {
          v.columns = [];
        }
      }

      if (v.columns && Array.isArray(v.columns)) {
        v.columns = v.columns
          .map((_v) => parseColumns(_v, deep + 1))
          .filter((c) => {
            return c !== false;
          });
      }
      if (v.valueType == 'group') {
        v.rowProps = { gutter: 16 };
      }

      if (devEnable && deep <= 1 && !React.isValidElement(v.title)) {
        v.title = <FormColumnTitle {...v} />;
      } else {
        v.title = tplComplie(v.title);
      }

      if (v.fieldProps?.placeholder) {
        v.fieldProps.placeholder = tplComplie(v.fieldProps.placeholder, { intl });
      }

      return v;
    }

    return false;
  };
  const _columns = customerColumns
    .map((c) => parseColumns(c))
    .filter((c) => {
      return c !== false;
    });
  //console.log('_columns', _columns);
  return _columns;
};
