import { css } from '@emotion/css';
import type { TableColumnsType } from 'antd';
import { default as cls } from 'classnames';
import React, { useContext } from 'react';
import type { ResizeCallbackData } from 'react-resizable';
import { Resizable } from 'react-resizable';
import { SaContext } from '../../posts/table';
import './index.css';

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
  //找到有fixed right的列

  let isLastCol: boolean = index + 1 == tbColumns.length;

  if (index > -1) {
    const fixedRight = tbColumns?.filter((col) => col.fixed === 'right');
    const fixedRightLength = fixedRight?.length;
    if (fixedRightLength > 0) {
      isLastCol = tbColumns?.[index].uid == fixedRight[fixedRightLength - 1].uid ? true : false;
    }
    //console.log('tbColumns?.[index]', tbColumns?.[index], fixedRight[fixedRightLength - 1]);
  }
  if (index < 0 || isLastCol || !devEnable) {
    //未找到或最后一个元素或未启用开发模式 直接原样返回
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
