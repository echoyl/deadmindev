import { SaContext } from '@/components/Sadmin/posts/table';
import JsonEditor from '@/components/Sadmin/valueTypeMap/jsonEditor';
import { Button, Space } from 'antd';
import { useContext, useState } from 'react';

const ConsoleLogShowFormValue = (props: any) => {
  const { formRef } = useContext(SaContext);
  const [value, setValue] = useState();
  const onClick = () => {
    const v = formRef.current?.getFieldsValue();
    console.log(v);
    setValue(v);
  };
  return (
    <Space orientation="vertical" style={{ width: '100%' }}>
      <Button onClick={onClick}>console.log</Button>
      <JsonEditor value={value} readOnly={true} />
    </Space>
  );
};
export default ConsoleLogShowFormValue;
