import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { css } from '@emotion/css';
import { getFromObject } from '../../helpers';
const DndKitContext = (props) => {
  const { onDragEnd, idName = 'uid', list = [], children, ...retProps } = props;

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });
  const dragEnd = ({ active, over }: DragEndEvent) => {
    const aid = getFromObject(active, 'id');
    const oid = getFromObject(over, 'id');
    const activeIndex = list.findIndex((i) => getFromObject(i, idName) === aid);
    let new_sort_data = list;
    if (aid !== oid) {
      const overIndex = list.findIndex((i) => getFromObject(i, idName) === oid);
      new_sort_data = arrayMove(list, activeIndex, overIndex);
      //setFileList([...new_sort_data]);
      //props.onChange?.([...new_sort_data]);
    }
    onDragEnd?.([...new_sort_data], activeIndex, aid !== oid); //自定义回调已排序的数据
  };
  const items = list?.map((i) => getFromObject(i, idName));
  return (
    <DndContext sensors={[sensor]} onDragEnd={dragEnd} {...retProps}>
      <SortableContext
        items={items}
        //strategy={horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

interface DragItemProps {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  item: Record<string, any>;
  idName?: string | string[];
  style?: React.CSSProperties | undefined;
}

export const DragItem = ({
  item,
  children,
  idName = 'uid',
  style: itemStyle = {},
}: DragItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getFromObject(item, idName),
  });
  const commonStyle = {
    cursor: 'move',
    transition: 'unset', // Prevent element from shaking after drag
    // height: '100%',
    // width: '100%',
    ...itemStyle,
  };
  // const style: React.CSSProperties = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };
  //默认横向移动
  const style = transform
    ? {
        ...commonStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
        ...(isDragging ? { zIndex: 9999 } : {}),
      }
    : commonStyle;

  // prevent preview event when drag end
  const className = isDragging
    ? css`
        a {
          pointer-events: none;
        }
      `
    : '';
  // return React.cloneElement(children, {
  //   ...attributes,
  //   ...listeners,
  //   className,
  //   style,
  //   ref: setNodeRef,
  // });
  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {/* hide error tooltip when dragging */}
      {children}
    </div>
  );
};

export default DndKitContext;
