import request from '@/components/Sadmin/lib/request';
import { ProFormSelect } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import type { SelectProps } from 'antd/es/select';
import React, { useEffect, useState } from 'react';
import { isArr, isObj, isStr, isUndefined } from '../../checkers';
import { tplComplie, uid } from '../../helpers';
import { isEqual } from 'es-toolkit';
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: { [key: string]: any }) => Promise<ValueType[]> | string;
  params?: object;
  readonly?: boolean;
}

export default function SearchSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
    readonly: boolean;
    extColumns?: string[]; //数据额外获取的列
  } = any,
>({ fetchOptions, params = {}, readonly = false, ...props }: DebounceSelectProps) {
  //console.log('record', record);
  const [options, setOptions] = useState<ValueType[]>([]);
  const { fieldNames = { label: 'label', value: 'id', children: 'children' }, extColumns = [] } =
    props;
  const { label = 'label', value: valueField = 'id' } = fieldNames;
  const { pathname } = useLocation();
  const [reloadKey, setReloadKey] = useState<string>('init');
  const [recordParams, setRecordParams] = useState<Record<string, any>>({});
  const [change, setChange] = useState(false);
  const [init, setInit] = useState<any>(false);
  const [readLabel, setReadLabel] = useState<any>(null);

  const parseItem = (item: Record<string, any>) => {
    if (!item[label]) {
      item[label] = tplComplie(label, { record: item });
    }
    const ret = {
      [valueField]: item[valueField],
      [label]: item[label],
      label: item[label],
      value: item[valueField],
    };
    extColumns?.map((v) => {
      ret[v] = item[v];
    });
    return ret;
  };

  useEffect(() => {
    //初始化处理一次label 如果label可能是模板
    const { value } = props;
    if (value) {
      if (isArr(value)) {
        //当值时数组是多选
        const newValue = value.map((item) => parseItem({ ...item }));
        setReadLabel(newValue.map((v) => v.label).join(','));
        props.onChange?.(newValue);
        return;
      } else if (isObj(value)) {
        const newValue = parseItem({ ...value });
        setReadLabel(newValue.label);
        props.onChange?.(newValue);
        return;
      }
    }
    setReadLabel(value);
  }, []);
  useEffect(() => {
    //依赖项数据发生变化后 清空当前值
    setInit(true); //第一次不渲染
    if (init) {
      props?.onChange?.(null);
      //console.log('recordParams', recordParams);
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
    //console.log('requestParam', requestParam, params);
    const { keyWords: keyword, reloadKey, ...restRequestParam } = requestParam;
    setChange(false);
    if (change) {
      return options;
    }
    if (keyword === '' && options.length > 0) {
      return options;
    }

    const _recordParams: Record<string, any> = {};
    const normalParms: Record<string, any> = {}; //params中固定的参数
    Object.keys(params).map((v) => {
      if (!isUndefined(requestParam[v])) {
        //_recordParams[v] = requestParam[v];
        //console.log('params[v] and requestParam', params[v], requestParam);
        //修复参数是模板时未渲染的问题
        _recordParams[v] = tplComplie(params[v], { record: requestParam });
      } else {
        normalParms[v] = params[v];
      }
    });
    if (!isEqual(_recordParams, recordParams)) {
      setRecordParams(_recordParams);
    }
    const get_params = {
      pageSize: 50,
      search: 1,
      from_path: pathname,
      keyword,
      ...restRequestParam,
      ..._recordParams,
      ...normalParms,
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
    const optionsx = ret?.data?.map((item: any) => parseItem(item));
    setOptions(optionsx);
    return optionsx;
  };
  const onChange = (v) => {
    props?.onChange?.(v);
    setChange(!isUndefined(v)); //选中选项设置true后 请求不会发出
    reload();
  };
  return readonly ? (
    <>{readLabel}</>
  ) : (
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
