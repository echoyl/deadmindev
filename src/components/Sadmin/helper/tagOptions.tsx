import { Tag } from 'antd';

export default (arr: Record<string, any>[], color?: string) => {
  return arr.map((v) => {
    return {
      title: v.label,
      label: <Tag color={v.color}>{v.label}</Tag>,
      value: v.value,
    };
  });
};
