import request from '@/components/Sadmin/lib/request';
import { ProFormSelect, ProFormCascader } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Cascader, Empty, Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isStr } from './checkers';
import { tplComplie } from './helpers';
import { SaContext } from './posts/table';
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: { [key: string]: any }) => Promise<ValueType[]> | string;
  debounceTimeout?: number;
  params?: object;
  type?: 'select' | 'cascader' | undefined;
}

export default function DebounceSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
    type?: 'select' | 'cascader' | undefined;
  } = any,
>({
  fetchOptions,
  debounceTimeout = 400,
  params = {},
  type = 'select',
  ...props
}: DebounceSelectProps) {
  const { formRef } = useContext(SaContext);
  const record = formRef.current ? formRef.current.getFieldsValue?.(true) : false;
  //console.log('record', record);
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const [thisValue, setThisValue] = useState<any>();
  const [isInit, setIsInit] = useState(false);
  const fetchRef = useRef(0);
  const { fieldNames = { label: 'label', value: 'id', children: 'children' } } = props;
  const { label = 'label' } = fieldNames;
  useEffect(() => {
    if (isInit) {
      //这里是当组件需要dependenceOn的时候 表单其它值变动后重新渲染这里需要重新请求获取一次数据信息，因为设置当前值的时候也会触发，所以在onchange的时候设置了isInit的状态
      setFetching(true);
      debounceFetcher('reload');
      //如果已经初始化 那么每次变动后都修改组件的value
      setThisValue(null);
    } else {
      //初始化处理一次label 如果label可能是模板
      const value = props.value;
      if (value && !value.label) {
        value.label = tplComplie(label, { record: value });
      }
      setThisValue(value);
      setIsInit(true);
    }
  }, [record]);

  if (isStr(fetchOptions)) {
    const url = fetchOptions;
    const { pathname } = useLocation();
    fetchOptions = async (requestParam: { [key: string]: any }) => {
      const { data } = await request.get(url, {
        params: { pageSize: 50, search: 1, from_path: pathname, ...requestParam },
      });
      //处理label显示 可以支持模板显示
      return data.map((item: any) => {
        if (!item[label]) {
          item[label] = tplComplie(label, { record: item });
        }
        return item;
      });
    };
  }

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      if (isStr(fetchOptions)) return;
      if (!value && options.length > 0) {
        return;
      }
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      const new_params = value == 'reload' ? {} : { keyword: value };
      if (record) {
        for (let i in params) {
          new_params[i] = tplComplie(params[i], { record });
        }
      }

      fetchOptions?.(new_params).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout, options]);

  const fieldProps = {
    fieldNames,
    onSearch: debounceFetcher,
    notFoundContent: fetching ? <Spin size="small" /> : <Empty />,
    showSearch: true,

    onFocus: () => {
      if (options?.length < 1) {
        setFetching(true);
        debounceFetcher('');
      }
    },
  };
  useEffect(() => {
    setFetching(true);
    debounceFetcher('');
  }, []);
  //console.log(props, fieldProps, props.fieldProps);
  // props.fieldProps = { ...fieldProps, ...props.fieldProps };
  const onChange = (v) => {
    setIsInit(false); //这里设置为false 因为设置值后 record就变动，但是我们当前值变动时不能触发重新请求的
    setThisValue(v);
    props?.onChange?.(v);
  };
  return type == 'select' ? (
    <ProFormSelect
      noStyle
      {...props}
      // value={thisValue}
      onChange={onChange}
      fieldProps={{ ...fieldProps, labelInValue: true, filterOption: false }}
      options={options}
    />
  ) : (
    <Cascader
      //noStyle={true}
      {...props}
      value={thisValue}
      onChange={onChange}
      {...fieldProps}
      options={options}
    />
  );
}
