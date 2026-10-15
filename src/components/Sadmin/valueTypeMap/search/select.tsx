import request from '@/components/Sadmin/lib/request';
import { ProFormCascader, ProFormSelect } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import type { SelectProps } from 'antd/es/select';
import { isEqual } from 'es-toolkit';
import React, { useEffect, useRef, useState } from 'react';
import { isArr, isObj, isStr, isUndefined } from '../../checkers';
import { tplComplie, uid } from '../../helpers';
import { CascaderProps, Form } from 'antd';
export interface DebounceSelectProps {
  fetchOptions: (search: Record<string, any>) => Promise<any[]> | string;
  params?: Record<string, any>;
  readonly?: boolean;
  dataindex?: string;
  extColumns?: string[];
  selectProps?: SelectProps;
  cascaderProps?: CascaderProps;
  type?: 'select' | 'cascader' | undefined;
  [key: string]: any;
}

//剔除搜索相关的 key，得到业务参数（依赖等）用于对比
const omitSearchKeys = (p: Record<string, any>) => {
  const { key, keyWords, kw, ...rest } = p;
  return rest;
};

/**
 * 依赖表单项的值变化时立即清空当前值。
 * 必须在 pro 的请求缓存 key 切换（debounce 后）、options 出现空窗之前执行，
 * 否则会出现「旧 value × 空/新 options」的闪烁帧（输入框短暂显示原始值或旧选中项）。
 */
function DepClearWatcher({ depKey, onClear }: { depKey: string; onClear: () => void }) {
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false; //挂载时不触发，保留回填值
      return;
    }
    onClear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);
  return null;
}

export default function SearchSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
    readonly: boolean;
    extColumns?: string[]; //数据额外获取的列
  } = any,
>({ fetchOptions, params = {}, readonly = false, type = 'select', ...props }: DebounceSelectProps) {
  //console.log('record', record);
  const [options, setOptions] = useState<ValueType[]>([]);
  const {
    fieldNames = { label: 'label', value: 'id', children: 'children' },
    extColumns = [],
    selectProps = {},
    cascaderProps = {},
  } = props;
  const { label = 'label', value: valueField = 'id', childrenField = 'children' } = fieldNames;
  const { pathname } = useLocation();
  const [reloadKey, setReloadKey] = useState<string>('init');
  const [nowKeyword, setNowKeyword] = useState<string>('');
  //cascader 远程搜索的关键字（pro 内部 keyWords 对 cascader 不生效，通过 params.kw 传给 getData）
  const [kw, setKw] = useState<string>('');
  const [recordParams, setRecordParams] = useState<Record<string, any>>({});
  const [readLabel, setReadLabel] = useState<any>(null);
  //记录上一次的依赖参数，首次计算结果作为基线，只有真正变化才清空当前值
  const prevRecordParams = useRef<Record<string, any> | null>(null);
  //上一次请求的完整参数（含搜索词 keyWords/kw，只剔除 reload 用的 key），用于检测依赖或搜索词变化
  const lastBaseParams = useRef<Record<string, any> | null>(null);
  //刚发生过一次选中：用于区分「选中后搜索词被组件自动清空」与「用户手动清空搜索」
  const justSelectedRef = useRef(false);
  //最近一次关键字搜索的结果：选中后保持展示，避免空关键字请求把 options 回退到完整列表
  const searchResultsRef = useRef<ValueType[]>([]);

  const parseItem = (item: Record<string, any>) => {
    if (!item[label]) {
      item[label] = tplComplie(label, { record: item });
    }
    const ret: Record<string, any> = {
      [valueField]: item[valueField],
      [label]: item[label],
      label: item[label],
      value: item[valueField],
    };
    if (item[childrenField]) {
      ret[childrenField] = item[childrenField];
    }
    extColumns?.map((v) => {
      ret[v] = item[v];
    });
    return ret;
  };

  useEffect(() => {
    //初始化处理一次label 如果label可能是模板
    const { value } = props;
    if (value && type == 'select') {
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
    //首次异步计算出的依赖参数作为基线，不清空回填的值；只有之后真正变化才清空
    if (Object.keys(recordParams).length === 0) return; //还没有计算出依赖参数
    if (prevRecordParams.current === null) {
      prevRecordParams.current = recordParams;
      return;
    }
    if (!isEqual(prevRecordParams.current, recordParams)) {
      prevRecordParams.current = recordParams;
      justSelectedRef.current = false;
      searchResultsRef.current = [];
      props?.onChange?.(null);
    }
  }, [recordParams]);

  const reload = () => {
    setReloadKey(uid());
    return;
  };

  const fieldProps = {
    fieldNames,
    showSearch: true,
    ...(type == 'select' ? selectProps : cascaderProps),
  };
  const getData = async (requestParam: Record<string, any>) => {
    //console.log('requestParam', requestParam, params);
    //select 的搜索词由 pro 内部注入到 keyWords；cascader 的搜索词通过 params.kw 传入（pro 内部 keyWords 对 cascader 不生效，会被覆盖为 undefined）
    //只剔除 reload 用的 key，keyWords/kw 一并参与深比较：任一变化都需要重新请求
    const { key, ...restRequestParam } = requestParam;
    const keyword = requestParam.keyWords ?? requestParam.kw;
    //深比较整个 requestParam（含搜索词）：依赖参数或搜索词任一变化都命中 paramsChanged
    const paramsChanged =
      !lastBaseParams.current || !isEqual(lastBaseParams.current, restRequestParam);
    if (!paramsChanged && options.length > 0) {
      //同参数的重复请求（如 reload 触发）：搜索词未变时保持搜索结果，不回退完整列表
      const keepSearchResults =
        (justSelectedRef.current || !!keyword) && searchResultsRef.current.length > 0;
      justSelectedRef.current = false; //消费一次即作废
      if (keepSearchResults) {
        return searchResultsRef.current;
      }
      //参数与搜索词都没变：直接返回缓存的完整选项树
      return options;
    }
    //值重置只看业务参数（不含搜索词）：输入/清空搜索词不应清空已选值
    const isParamChangeRun =
      lastBaseParams.current !== null &&
      !isEqual(omitSearchKeys(lastBaseParams.current), omitSearchKeys(restRequestParam));
    if (isParamChangeRun) {
      //业务参数变化是全新的数据上下文，作废选中标记与旧搜索结果
      justSelectedRef.current = false;
      searchResultsRef.current = [];
      setReadLabel(null);
      props?.onChange?.(null);
    }
    if (justSelectedRef.current && !keyword && searchResultsRef.current.length > 0) {
      //选中后搜索词被组件自动清空导致的 paramsChanged：不重新请求，保持搜索结果
      justSelectedRef.current = false;
      return searchResultsRef.current;
    }
    //比较结果作为基线并每次请求都推进：搜索词已参与对比，
    //后续无词请求仍会因 keyWords 差异命中 paramsChanged，不会吞掉依赖变化的检测
    lastBaseParams.current = restRequestParam;
    setNowKeyword(keyword || '');

    const _recordParams: Record<string, any> = {};
    const normalParms: Record<string, any> = {}; //params中固定的参数
    Object.keys(params).map((key) => {
      const v = params[key];
      const is_tpl = v.toString().indexOf('{{') == 0;
      if (is_tpl) {
        //_recordParams[v] = requestParam[v];
        //console.log('params[v] and requestParam', params[v], requestParam);
        //修复参数是模板时未渲染的问题
        _recordParams[key] = tplComplie(v, { record: requestParam });
      } else {
        //检测v是否是{{开头，如果是的话直接过滤掉
        normalParms[key] = v;
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
    if (isParamChangeRun) {
      //数据到达时与新 options 同一批次重置 value，保证不会出现“旧值在新数据上先选中、随后才被清空”的中间帧
      setReadLabel(null);
      props?.onChange?.(null);
    }
    if (keyword) {
      //搜索结果单独留存，供选中后的保持展示使用；不覆盖缓存的完整选项树
      searchResultsRef.current = optionsx || [];
      justSelectedRef.current = false; //新一轮搜索开始，选中标记作废
    } else {
      //只有无关键词的请求才更新缓存的完整选项树，搜索结果不覆盖它
      justSelectedRef.current = false;
      searchResultsRef.current = [];
      setOptions(optionsx);
    }
    return optionsx;
  };
  const onChange = (v: any) => {
    props?.onChange?.(v);
    const cleared = isUndefined(v) || v === null || (isArr(v) && v.length === 0);
    if (cleared) {
      //主动清空：作废选中标记，后续请求正常走完整列表
      justSelectedRef.current = false;
      //清空选项：之前是通过 keyword 搜索出的结果时，清空 options 并重新请求完整数据；否则保留缓存不请求
      if (nowKeyword) {
        setOptions([]);
        setNowKeyword('');
        if (type == 'cascader') {
          setKw(''); //清掉搜索关键字，params 变化触发重新请求
        }
        reload();
      }
    } else {
      //刚从搜索结果中选中：标记之，防止随后搜索词被组件自动清空时 options 回退到完整列表
      justSelectedRef.current = true;
      //注意：不能 reload —— 更换 swr 缓存 key 后新条目 data 先为 undefined，
      //数据面板保持打开时选项会先空一帧再渲染回来（闪烁）。现有缓存本就是搜索结果，无需换代
    }
  };
  //依赖表单项的值变化时，在 t=0（debounce/请求之前）立即清空当前值，堵住「旧value × 空options」闪烁帧
  const depNames = props.dependencies || [];
  const clearOnDepChange = () => {
    justSelectedRef.current = false;
    searchResultsRef.current = [];
    setReadLabel(null);
    props?.onChange?.(null);
  };
  return readonly ? (
    <>{readLabel}</>
  ) : (
    <>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => depNames.some((n) => !isEqual(prev?.[n], next?.[n]))}
      >
        {({ getFieldValue }) => (
          <DepClearWatcher
            depKey={JSON.stringify(depNames.map((n) => getFieldValue(n)))}
            onClear={clearOnDepChange}
          />
        )}
      </Form.Item>
      {type == 'select' ? (
        <ProFormSelect
          noStyle
          {...props}
          //value={thisValue}
          debounceTime={500}
          request={getData}
          onChange={onChange}
          params={{ key: reloadKey }}
          name={props.dataindex}
          dependencies={depNames}
          fieldProps={{
            ...fieldProps,
            labelInValue: true,
            filterOption: false,
          }}
        />
      ) : (
        <ProFormCascader
          noStyle
          {...props}
          //value={thisValue}
          debounceTime={500}
          request={getData}
          onChange={onChange}
          params={{ key: reloadKey, kw }}
          name={props.dataindex}
          dependencies={depNames}
          fieldProps={{
            ...fieldProps,
            multiple: props.multiple,
            showSearch: {
              //输入时把关键字放入 params.kw，params 变化会重新发起 request（debounceTime 防抖）
              onSearch: (v: string) => setKw(v),
              ...(isObj(fieldProps.showSearch) ? (fieldProps.showSearch as any) : {}),
            },
          }}
        />
      )}
    </>
  );
}
