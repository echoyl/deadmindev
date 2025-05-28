import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import React, { useContext, useMemo } from 'react';
import { css } from '@emotion/css';
import { getFromObject } from '../../helpers';
import { Button } from 'antd';
import { HolderOutlined } from '@ant-design/icons';

interface DndKitContextProps {
  children: any;
  list: Record<string, any>[] | any[];
  idName?: string | string[];
  restrict?: 'vertical' | 'horizontal' | undefined; //限制拖拽方向 vertical horizontal undefined
  onDragEnd?(list: Record<string, any>[] | any[], more?: Record<string, any>): void;
}
const DndKitContext = (props: DndKitContextProps) => {
  const { onDragEnd, idName = 'uid', list = [], children, restrict, ...retProps } = props;

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });
  const dragEnd = ({ active, over }: DragEndEvent) => {
    const aid = getFromObject(active, 'id');
    const oid = getFromObject(over, 'id');
    const activeIndex = list.findIndex((i) => getFromObject(i, idName) === aid);
    let new_sort_data = list;
    let overIndex = -1;
    if (aid !== oid) {
      overIndex = list.findIndex((i) => getFromObject(i, idName) === oid);
      new_sort_data = arrayMove(list, activeIndex, overIndex);
    }
    onDragEnd?.([...new_sort_data], {
      activeIndex,
      overIndex,
      change: aid !== oid,
      event: { active, over },
    }); //自定义回调已排序的数据
  };
  const items = list?.map((i) => getFromObject(i, idName));
  //restrict 如果是vertical 则限制只能上下拖拽，horizontal 则限制只能左右拖拽
  const modifiers =
    restrict == 'vertical'
      ? [restrictToVerticalAxis]
      : restrict == 'horizontal'
        ? [restrictToHorizontalAxis]
        : undefined;
  const strategy =
    restrict == 'vertical'
      ? verticalListSortingStrategy
      : restrict == 'horizontal'
        ? horizontalListSortingStrategy
        : undefined;
  return (
    <DndContext modifiers={modifiers} sensors={[sensor]} onDragEnd={dragEnd} {...retProps}>
      <SortableContext items={items} strategy={strategy}>
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
  handle?: boolean;
}

interface ItemContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const DragItemContext = React.createContext<ItemContextProps>({});

export const DragItem = ({
  item,
  children,
  idName = 'uid',
  style: itemStyle = {},
  handle = true, //默认dom就是拖拽手柄
}: DragItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getFromObject(item, idName),
  });
  const commonStyle = {
    //transition: 'unset', // Prevent element from shaking after drag
    // height: '100%',
    // width: '100%',
    ...itemStyle,
  };
  if (handle) {
    commonStyle.cursor = 'move';
  }
  // const style: React.CSSProperties = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };
  //默认横向移动
  const style = transform
    ? {
        ...commonStyle,
        transform: CSS.Translate.toString(transform),
        transition,
        //transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        //transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
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
  //console.log('children type', typeof children.type, children.type);
  //如果传入的children是html标签 那么直接复制该标签将拖拽属性添加到该标签上，如果是function函数组件，那么因为无法设置ref所以默认加入一个外层div包裹
  const ls = handle ? listeners : {}; //如果设置为不是手柄 则不用添加监听事件
  const dom =
    typeof children.type === 'string' ? (
      React.cloneElement(children, {
        ...attributes,
        ...ls,
        className,
        ...children.props, //保留原有属性
        style: {
          ...children.props?.style,
          ...style,
        },
        ref: setNodeRef,
      })
    ) : (
      <div ref={setNodeRef} style={style} className={className} {...attributes} {...ls}>
        {/* hide error tooltip when dragging */}
        {children}
      </div>
    );
  // return React.cloneElement(children, {
  //   ...attributes,
  //   ...listeners,
  //   className,
  //   style,
  //   ref: setNodeRef,
  // });
  const contextValue = useMemo<ItemContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );
  return <DragItemContext.Provider value={contextValue}>{dom}</DragItemContext.Provider>;
};

export const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(DragItemContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

export default DndKitContext;
