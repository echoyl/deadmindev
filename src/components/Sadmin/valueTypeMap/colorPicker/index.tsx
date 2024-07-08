import { BgColorsOutlined } from '@ant-design/icons';
import { ColorPicker as ColorPickerAnt, Input } from 'antd';
import { Color } from 'antd/es/color-picker';
import { useState } from 'react';

const ColorPicker = (props) => {
  const { onChange, colorType = 'hex' } = props;
  const [value, setValue] = useState(props?.value ? props?.value : '#ffffff');
  const getColorValueString = (color: Color) => {
    if (colorType == 'rgb') {
      return color.toRgbString();
    } else {
      return color.toHexString();
    }
  };
  return (
    <ColorPickerAnt
      value={value}
      onChange={(color) => {
        const colorValueString = getColorValueString(color);
        onChange?.(colorValueString);
        setValue(colorValueString);
      }}
      presets={[
        {
          label: 'Recommended',
          colors: [
            'red',
            '#000000',
            '#F5222D',
            '#FA8C16',
            '#FADB14',
            '#8BBB11',
            '#52C41A',
            '#13A8A8',
            '#1677FF',
            '#2F54EB',
            '#722ED1',
          ],
        },
      ]}
    >
      <Input
        addonBefore={<BgColorsOutlined style={{ color: value }} />}
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          setValue(e.target.value);
        }}
      />
    </ColorPickerAnt>
  );
};

export const ColorPickerRel = (props) => {
  return <ColorPicker {...props} />;
};

export const ColorPickerMap = (_, props) => {
  const { fieldProps } = props;
  return <ColorPickerRel {...fieldProps} />;
};

export default ColorPicker;
