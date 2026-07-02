import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext as DndKitContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import type { Props } from '@dnd-kit/core/dist/components/DndContext/DndContext';

import { useContext } from 'react';
import { SaPageContext } from '../../404';
import { SaContext } from '../../posts/table';

const useDragEnd = (props?: any, pageMenu?: any) => {
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
    if (pageMenu) {
      if (active.data.current?.devData.type == 'panel') {
        tableDesigner?.sort?.(
          pageMenu.id,
          [
            { uid: active?.id, devData: active.data.current?.devData },
            { uid: over?.id, devData: over.data.current?.devData },
          ],
          active.data.current?.devData.type,
        );
      } else {
        tableDesigner?.sort?.(
          pageMenu.id,
          [active?.id, over?.id],
          active.data.current?.devData.type,
        );
      }
    }
  };
};

export const DndContext = (props: Props) => {
  //const [visible, setVisible] = useState(true);
  const { pageMenu } = useContext(SaPageContext);
  return (
    <DndKitContext
      collisionDetection={rectIntersection}
      accessibility={{ container: document.body }}
      {...props}
      onDragStart={(event) => {
        //const { active } = event;
        //const activeSchema = active?.data?.current?.schema;
        //setVisible(!!activeSchema);
        if (props?.onDragStart) {
          props?.onDragStart?.(event);
        }
      }}
      onDragEnd={useDragEnd(props, pageMenu)}
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
