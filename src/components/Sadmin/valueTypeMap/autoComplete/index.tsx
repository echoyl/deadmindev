import { AutoComplete, Input } from 'antd';
import { useState } from 'react';

const SaAutoComplete = (props) => {
  const {
    value: ivalue,
    onChange: uonChang,
    type = 'input',
    options = [],
    placeholder = '',
  } = props;
  const [value, setValue] = useState(ivalue);
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
      options={options}
      style={{ width: '100%' }}
      // onSelect={onSelect}
      // onSearch={handleSearch}
      onSelect={onSelect}
    >
      {type == 'input' ? (
        <Input
          placeholder={placeholder}
          //style={{ height: 50 }}
          //onKeyPress={handleKeyPress}
          value={value}
          onChange={onChange}
        />
      ) : (
        <Input.TextArea
          placeholder={placeholder}
          //style={{ height: 50 }}
          rows={4}
          //onKeyPress={handleKeyPress}
          value={value}
          onChange={onChange}
        />
      )}
    </AutoComplete>
  );
};

const SaAutoCompleteRel = (props) => {
  return <SaAutoComplete {...props} />;
};

const SaAutoCompleteMap = (_, props) => {
  const { fieldProps } = props;
  //console.log('props', props);
  return <SaAutoCompleteRel {...fieldProps} />;
};
export default SaAutoCompleteMap;
