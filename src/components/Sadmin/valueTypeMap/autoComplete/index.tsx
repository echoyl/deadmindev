import request from '@/components/Sadmin/lib/request';
import type { ProFieldFCRenderProps } from '@ant-design/pro-components';
import { AutoComplete, Empty, Input } from 'antd';
import { useEffect, useRef, useState } from 'react';

const SaAutoComplete = (props: any) => {
  const {
    value: ivalue,
    onChange: uonChang,
    type = 'input',
    options: staticOptions = [],
    placeholder = '',
    url,
    debounceMs = 300,
    requestParams = {},
    fieldNames = { label: 'label', value: 'value' },
    comProps = {}, //组件属性
  } = props;
  const [value, setValue] = useState(ivalue);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const debounceRef = useRef<any>(null);
  const [keyword, setKeyword] = useState<string>('');
  const options = url ? asyncOptions : staticOptions;
  const handleSearch = (searchText: string) => {
    if (!url) return;
    setKeyword(searchText);
    if (!searchText && !keyword && options.length > 0) {
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await request.get(url, {
          params: { keyword: searchText, ...requestParams },
        });
        setAsyncOptions(
          data?.map((v: Record<string, any>) => {
            return {
              label: v[fieldNames.label],
              value: v[fieldNames.value],
            };
          }) || [],
        );
      } catch {
        setAsyncOptions([]);
      }
    }, debounceMs);
  };

  useEffect(() => {
    if (url) {
      handleSearch('');
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onChange = (e) => {
    const { value: inputValue } = e.target;
    uonChang(inputValue);
    setValue(inputValue);
  };

  const onSelect = (v) => {
    uonChang(v);
    setValue(v);
  };

  return (
    <AutoComplete
      {...comProps}
      options={options}
      style={{ width: '100%' }}
      showSearch={{
        onSearch: handleSearch,
      }}
      onSelect={onSelect}
      onClear={() => {
        onSelect('');
      }}
      notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    >
      {type == 'input' ? (
        <Input placeholder={placeholder} value={value} onChange={onChange} />
      ) : (
        <Input.TextArea placeholder={placeholder} rows={4} value={value} onChange={onChange} />
      )}
    </AutoComplete>
  );
};

const SaAutoCompleteRel = (props: Record<string, any>) => {
  return <SaAutoComplete {...props} />;
};

const SaAutoCompleteMap = (_: any, props: ProFieldFCRenderProps) => {
  const { fieldProps } = props;
  //console.log('props', props);
  return <SaAutoCompleteRel {...fieldProps} />;
};
export default SaAutoCompleteMap;
