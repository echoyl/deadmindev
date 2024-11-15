import { Slider } from 'antd';
import { useEffect, useState } from 'react';
import request from '../../lib/request';

const SaSlider = (props) => {
  const {
    value: ivalue,
    onChange: uonChang,
    url = '',
    min = 0,
    max = 100,
    marks = { 0: '0', 100: '100' },
  } = props;
  const [value, setValue] = useState(ivalue);
  const onChange = (e) => {
    uonChang(e);
    setValue(e);
  };

  const [range, setRange] = useState<{ min: number; max: number }>({ min, max });

  const set = ({ code, data }) => {
    if (!code) {
      setRange({ ...data });
    }
  };
  useEffect(() => {
    setRange({ min, max });
  }, [min, max]);

  useEffect(() => {
    if (url) {
      request.get(url).then(set);
    }
  }, []);

  return (
    <Slider
      range
      defaultValue={[range.min, range.max]}
      min={range.min}
      max={range.max}
      marks={marks}
      value={value}
      onChange={onChange}
    />
  );
};

const SliderRel = (props) => {
  return <SaSlider {...props} />;
};

const SaSliderMap = (_, props) => {
  const { fieldProps } = props;
  return <SliderRel {...fieldProps} />;
};
export default SaSliderMap;
