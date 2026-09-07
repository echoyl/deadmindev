import { Segmented, type SegmentedProps } from 'antd';
import { useEffect, useRef } from 'react';
import { iconToElement } from '../iconSelect';

export type RadioSegmentedFieldNames = { label?: string; value?: string };

export const RadioSegmentedRel = (props: SegmentedProps & { fieldNames?: RadioSegmentedFieldNames }) => {
  const { options, fieldNames = { label: 'label', value: 'value' }, value, onChange, defaultValue, ...rest } = props;
  const valueField = fieldNames.value || 'value';
  const labelField = fieldNames.label || 'label';
  const segmentedOptions = (options || []).map((option) => {
    if (typeof option === 'object' && option !== null) {
      const item = option as Record<string, any>;
      const icon = item.icon;
      return {
        label: item[labelField],
        value: item[valueField] as string | number,
        disabled: item.disabled,
        icon: typeof icon === 'string' ? iconToElement(icon) : icon,
      };
    }
    return option;
  });

  const firstValue = (() => {
    const first = segmentedOptions[0];
    return typeof first === 'object' && first !== null ? first.value : first;
  })();

  const appliedRef = useRef(false);
  useEffect(() => {
    if (appliedRef.current) return;
    if ((value === undefined || value === null) && defaultValue === undefined && onChange) {
      if (firstValue !== undefined) {
        appliedRef.current = true;
        onChange(firstValue);
      }
    }
  }, [value, defaultValue, onChange, firstValue]);

  let currentValue = value;
  if (currentValue === undefined || currentValue === null) {
    if (defaultValue !== undefined) {
      currentValue = defaultValue;
    } else if (firstValue !== undefined) {
      currentValue = firstValue;
    }
  }

  const segmentedProps: SegmentedProps = { options: segmentedOptions, ...rest };
  if (currentValue !== undefined) {
    segmentedProps.value = currentValue;
  }
  if (onChange) {
    segmentedProps.onChange = onChange as SegmentedProps['onChange'];
  }
  return <Segmented {...segmentedProps} />;
};

export const RadioSegmentedMap = (_: any, props: any) => {
  const { fieldProps } = props;
  return <RadioSegmentedRel {...fieldProps} />;
};

export default RadioSegmentedRel;