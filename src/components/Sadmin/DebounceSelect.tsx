import request from '@/services/ant-design-pro/sadmin';
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
  const record = formRef.current.getFieldsValue?.(true);
  //console.log('record', record);
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const [thisValue, setThisValue] = useState(props.value);
  const [isInit, setIsInit] = useState(false);
  const fetchRef = useRef(0);
  if (isStr(fetchOptions)) {
    const url = fetchOptions;
    const { pathname } = useLocation();
    fetchOptions = async (requestParam: { [key: string]: any }) => {
      const { data } = await request.get(url, {
        params: { pageSize: 50, search: 1, from_path: pathname, ...requestParam },
      });
      return data;
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

      for (let i in params) {
        new_params[i] = tplComplie(params[i], { record });
      }
      fetchOptions(new_params).then((newOptions) => {
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

  useEffect(() => {
    if (isInit) {
      //console.log('set init', record);
      setFetching(true);
      debounceFetcher('reload');
      //如果已经初始化 那么每次变动后都修改组件的value
      setThisValue(null);
    } else {
      //console.log('set init', record);
      setIsInit(true);
    }
  }, [record]);
  const fieldProps = {
    fieldNames: props.fieldNames
      ? props.fieldNames
      : { label: 'name', value: 'id', children: 'children' },
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

  return type == 'select' ? (
    <ProFormSelect
      {...props}
      // value={thisValue}
      // onChange={(v) => {
      //   console.log('change v', v);
      //   // if (v.value) {
      //   //   v.id = v.value;
      //   // }
      //   setIsInit(false);
      //   setThisValue(v);
      //   props?.onChange?.(v);
      // }}
      //labelInValue
      fieldProps={{ ...fieldProps, labelInValue: true, filterOption: false }}
      // filterOption={false}
      // {...fieldProps}
      options={options}
    />
  ) : (
    <Cascader
      {...props}
      value={thisValue}
      onChange={(v) => {
        console.log('change v', v);
        setIsInit(false);
        setThisValue(v);
        props?.onChange?.(v);
      }}
      {...fieldProps}
      options={options}
    />
  );
}
