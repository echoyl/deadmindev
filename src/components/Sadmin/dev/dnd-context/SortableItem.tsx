import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cx } from '@emotion/css';
import React, { HTMLAttributes, createContext, useContext } from 'react';

export const DraggableContext = createContext(null);
export const SortableContext = createContext(null);

export const SortableProvider = (props) => {
  const { id, data, children } = props;
  const draggable = useDraggable({
    id,
    data,
  });
  const droppable = useDroppable({
    id,
    data,
  });
  return (
    <SortableContext.Provider value={{ draggable, droppable }}>{children}</SortableContext.Provider>
  );
};

export const Sortable = (props: any) => {
  const { component, overStyle, style, children, openMode, ...others } = props;
  const { draggable, droppable } = useContext(SortableContext);
  const { isOver, setNodeRef } = droppable;
  const droppableStyle = { ...style };
  //const { token } = theme.useToken();
  if (isOver && draggable?.active?.id !== droppable?.over?.id) {
    droppableStyle[component === 'a' ? 'color' : 'background'] = '#e6f7ff';
    Object.assign(droppableStyle, overStyle);
  }

  return React.createElement(
    component || 'div',
    {
      role: 'none',
      ...others,
      className: cx('nb-sortable-designer', props.className),
      ref: setNodeRef,
      style: droppableStyle,
    },
    children,
  );
};

interface SortableItemProps extends HTMLAttributes<HTMLDivElement> {
  eid?: string;
  removeParentsIfNoChildren?: boolean;
  devData?: any;
}

export const SortableItem: React.FC<SortableItemProps> = (props) => {
  const { id, eid, removeParentsIfNoChildren, devData, ...others } = props;
  return (
    <SortableProvider
      id={id}
      data={{
        insertAdjacent: 'afterEnd',
        removeParentsIfNoChildren: removeParentsIfNoChildren ?? true,
        devData,
      }}
    >
      <Sortable id={eid} {...others}>
        {props.children}
      </Sortable>
    </SortableProvider>
  );
};

export const DragHandler = (props) => {
  const { draggable } = useContext(SortableContext);
  const { attributes, listeners, setNodeRef } = draggable;

  return (
    <div
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        lineHeight: '14px',
        textAlign: 'left',
      }}
    >
      <div
        ref={setNodeRef}
        style={{
          // ...style,
          position: 'relative',
          zIndex: 1,
          // backgroundColor: '#333',
          lineHeight: 0,
          fontSize: 0,
          display: 'inline-block',
        }}
        {...listeners}
        {...attributes}
        role="none"
      >
        <span style={{ cursor: 'move', fontSize: 14 }}>{props.children}</span>
      </div>
    </div>
  );
};
