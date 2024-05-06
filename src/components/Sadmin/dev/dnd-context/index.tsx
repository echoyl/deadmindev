import {
  DndContext as DndKitContext,
  DragEndEvent,
  DragOverlay,
  rectIntersection,
} from '@dnd-kit/core';
import { Props } from '@dnd-kit/core/dist/components/DndContext/DndContext';

import { useContext, useState } from 'react';
import { SaContext } from '../../posts/table';

const useDragEnd = (props?: any) => {
  const { tableDesigner } = useContext(SaContext);
  return (event: DragEndEvent) => {
    const { active, over } = event;
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

export const DndContext = (props: Props) => {
  const [visible, setVisible] = useState(true);
  return (
    <DndKitContext
      collisionDetection={rectIntersection}
      accessibility={{ container: document.body }}
      {...props}
      onDragStart={(event) => {
        const { active } = event;
        const activeSchema = active?.data?.current?.schema;
        setVisible(!!activeSchema);
        if (props?.onDragStart) {
          props?.onDragStart?.(event);
        }
      }}
      onDragEnd={useDragEnd(props)}
    >
      <DragOverlay
        dropAnimation={{
          duration: 1,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>拖拽中</span>
      </DragOverlay>
      {props.children}
    </DndKitContext>
  );
};
