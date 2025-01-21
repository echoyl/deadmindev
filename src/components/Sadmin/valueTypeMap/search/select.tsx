import request from '@/components/Sadmin/lib/request';
import { ProFormSelect } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import type { SelectProps } from 'antd/es/select';
import React, { useEffect, useState } from 'react';
import { isObj, isStr, isUndefined } from '../../checkers';
import { tplComplie, uid } from '../../helpers';
import _ from 'lodash';
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: { [key: string]: any }) => Promise<ValueType[]> | string;
  params?: object;
}

export default function SearchSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
  } = any,
>({ fetchOptions, params = {}, ...props }: DebounceSelectProps) {
  //console.log('record', record);
  const [options, setOptions] = useState<ValueType[]>([]);
  const { fieldNames = { label: 'label', value: 'id', children: 'children' } } = props;
  const { label = 'label' } = fieldNames;
  const { pathname } = useLocation();
  const [reloadKey, setReloadKey] = useState<string>('init');
  const [recordParams, setRecordParams] = useState<Record<string, any>>({});
  const [change, setChange] = useState(false);
  const [init, setInit] = useState<any>(false);
  useEffect(() => {
    //初始化处理一次label 如果label可能是模板
    const { value } = props;
    if (value && isObj(value) && !value.label) {
      value.label = tplComplie(label, { record: value });
    }
  }, []);
  useEffect(() => {
    //依赖项数据发生变化后 清空当前值
    setInit(true); //第一次不渲染
    if (init) {
      props?.onChange?.(null);
      console.log('recordParams', recordParams);
    }
  }, [recordParams]);

  const reload = () => {
    setReloadKey(uid());
    return;
  };

  const fieldProps = {
    fieldNames,
    showSearch: true,
  };
  const getData = async (requestParam: { [key: string]: any }) => {
    //console.log('requestParam', requestParam, change);
    const { keyWords: keyword, reloadKey, ...restRequestParam } = requestParam;
    setChange(false);
    if (change) {
      return options;
    }
    if (keyword === '' && options.length > 0) {
      return options;
    }

    const _recordParams: Record<string, any> = {};
    Object.keys(params).map((v) => {
      if (!isUndefined(requestParam[v])) {
        _recordParams[v] = requestParam[v];
      }
    });
    if (!_.isEqual(_recordParams, recordParams)) {
      setRecordParams(_recordParams);
    }
    const get_params = {
      pageSize: 50,
      search: 1,
      from_path: pathname,
      keyword,
      ...restRequestParam,
    };
    let ret;
    if (isStr(fetchOptions)) {
      const url = fetchOptions;
      ret = await request.get(url, {
        params: get_params,
      });
    } else {
      ret = await fetchOptions(get_params);
    }
    //处理label显示 可以支持模板显示
    const optionsx = ret?.data?.map((item: any) => {
      //const newitem: Record<string, any> = {};
      if (!item[label]) {
        item[label] = tplComplie(label, { record: item });
      }
      return item;
    });
    setOptions(optionsx);
    return optionsx;
  };
  const onChange = (v) => {
    props?.onChange?.(v);
    setChange(!isUndefined(v)); //选中选项设置true后 请求不会发出
    reload();
  };
  return (
    <ProFormSelect
      noStyle
      {...props}
      //value={thisValue}
      debounceTime={400}
      request={getData}
      onChange={onChange}
      params={{ reloadKey }}
      name={props.dataindex}
      dependencies={Object.keys(params)}
      fieldProps={{
        ...fieldProps,
        labelInValue: true,
        filterOption: false,
      }}
    />
  );
}
