import { HolderOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/react';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Button } from 'antd';
import { css } from 'antd-style';
import { isUndefined } from 'es-toolkit';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SaContext } from '../../posts/table';

/**
 * 开发模式下的排序结束事件
 * @param props
 * @returns
 */
const useDevDragEnd = (props?: any) => {
  const { tableDesigner } = useContext(SaContext);
  return (event: DragEndEvent) => {
    const { operation, canceled } = event;
    const { source: active, target: over } = operation;
    //console.log('dragging', active, over, tableDesigner?.pageMenu);
    if (!over) {
      return;
    }
    if (active?.id == over?.id) {
      return;
    }
    const page_menu = tableDesigner?.pageMenu;
    if (page_menu) {
      if (active.data.current?.devData.type == 'panel') {
        tableDesigner?.sort?.(
          page_menu.id,
          [
            { uid: active?.id, devData: active.data.current?.devData },
            { uid: over?.id, devData: over.data.current?.devData },
          ],
          active.data.current?.devData.type,
        );
      } else {
        tableDesigner?.sort?.(
          page_menu.id,
          [active?.id, over?.id],
          active.data.current?.devData.type,
        );
      }
    }
  };
};

export const SortContext = createContext<{ items?: any[] }>({});
export const SortItemContext = createContext<{ handleRef?: any }>({});

const DndReact = (props) => {
  const { children, items, ...restProps } = props;

  return (
    <DragDropProvider
      // onDragStart={(event, manager) => {
      //   const { operation } = event;
      //   console.log(`Started dragging ${operation.source.id}`);
      // }}
      // onDragEnd={(event, manager) => {
      //   const { operation, canceled } = event;
      //   const { source, target } = operation;

      //   if (canceled) {
      //     // Replaces onDragCancel
      //     console.log(`Cancelled dragging ${source.id}`);
      //     return;
      //   }

      //   if (target) {
      //     console.log(`Dropped ${source.id} over ${target.id}`);
      //     // Access rich data
      //     console.log('Source data:', source.data);
      //     console.log('Drop position:', operation.position.current);
      //   }
      // }}
      {...restProps}
    >
      <SortContext value={{ items }}>{children}</SortContext>
    </DragDropProvider>
  );
};

/**
 * 拖拽按钮
 */
export const SortHandle: React.FC<{ [key: string]: any }> = ({ ...props }) => {
  const { handleRef } = useContext(SortItemContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={handleRef}
      {...props}
    />
  );
};

/**
 * 拖拽整体
 * @param param0
 * @returns
 */
export const SortItem = (props) => {
  const { children, id, index: oindex, style = {}, ...restProps } = props;
  const { items } = useContext(SortContext);
  const [index, setIndex] = useState(oindex);
  useEffect(() => {
    if (isUndefined(oindex)) {
      setIndex(items?.findIndex((item) => item.id == id));
    }
  }, []);
  const { ref, isDragging, handleRef } = useSortable({ id, index });

  // const commonStyle = {
  //   ...itemStyle,
  // };
  // //console.log('restProps', restProps, children.props, children.type);
  // //默认横向移动
  // const style = {
  //   ...commonStyle,
  //   //transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  //   //transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
  //   //...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  // };
  // const style = transform
  //   ? {
  //       ...commonStyle,
  //       transform: CSS.Translate.toString(transform),
  //       transition,
  //       //transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  //       //transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
  //       ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  //     }
  //   : commonStyle;

  // prevent preview event when drag end
  const className = isDragging
    ? css`
        a {
          pointer-events: none;
        }
      `
    : '';
  console.log('props', children.props.children?.[0]?.props?.className);
  const dom = React.cloneElement(children, {
    className,
    ...children.props, //保留原有属性
    style: {
      ...children.props?.style,
      ...style,
    },
    ref: ref,
  });
  return <SortItemContext value={{ handleRef }}>{dom}</SortItemContext>;
};

export default DndReact;
