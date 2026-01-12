import type { InputRef } from 'antd';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { isNumberLike } from '../checkers';
import { DragItem } from '../dev/dnd-context/dragSort';

interface EditableRowProps {
  index: number;
  'data-row-key': string;
}

const EditableContext = React.createContext<FormInstance<any> | null>(null);
export const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <DragItem item={{ uid: props?.['data-row-key'] }} handle={false}>
          <tr {...props} />
        </DragItem>
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: Record<string, any>;
  handleSave: (record: Record<string, any>) => void;
  type: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  type,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form?.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form?.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      toggleEdit();
      //console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: <></>,
          },
          {
            validator: (_, value) => {
              if (type == 'number') {
                return isNumberLike(value) ? Promise.resolve() : Promise.reject(new Error());
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};
