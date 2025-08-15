import React, { useContext } from 'react';
import type { TableColumnsType } from 'antd';
import type { ResizeCallbackData } from 'react-resizable';
import { Resizable } from 'react-resizable';
import './index.css';
import { SaContext } from '../../posts/table';
import { css } from '@emotion/css';
import { default as cls } from 'classnames';

interface DataType {
  key: React.Key;
  date: string;
  amount: number;
  type: string;
  note: string;
}

interface TitlePropsType {
  width: number;
  uid: string;
  //onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void;
}

const ResizableTitle: React.FC<Readonly<React.HTMLAttributes<any> & TitlePropsType>> = (props) => {
  const { width, uid, ...restProps } = props;
  const {
    tableDesigner: { setColumns, tbColumns, setColumnWidth, pageMenu, devEnable },
  } = useContext(SaContext);
  const index = tbColumns?.findIndex((col) => col.uid === uid);
  if (index < 0 || !devEnable) {
    return <th {...restProps} />;
  }
  //console.log('width', width, uid, props);
  //增加在开发模式下的表头样式，防止宽度过低导致断行
  return (
    <Resizable
      width={width ?? 180}
      height={0}
      handle={<span className="react-resizable-handle" onClick={(e) => e.stopPropagation()} />}
      onResize={(_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
        //console.log('size', uid, size, tbColumns);
        const newColumns = [...tbColumns];
        newColumns[index] = {
          ...newColumns[index],
          width: size.width,
        };
        setColumns(newColumns);
      }}
      onResizeStop={(_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
        //resize 完成后提交数据 更新列宽
        setColumnWidth({ uid, width: size.width, id: pageMenu?.id });
      }}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th
        {...restProps}
        className={cls(
          props.className,
          css`
            max-width: 300px;
            white-space: nowrap;
            &:hover .general-schema-designer {
              display: block;
            }
          `,
        )}
      />
    </Resizable>
  );
};

export const onHeaderCell = (column: TableColumnsType<DataType>[number]) => ({
  width: column.width,
  uid: column?.uid,
});

export default ResizableTitle;
