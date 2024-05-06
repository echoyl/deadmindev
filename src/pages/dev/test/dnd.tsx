import { DndContext } from '@/components/Sadmin/dev/dnd-context';
import { DragHandler, SortableItem } from '@/components/Sadmin/dev/dnd-context/SortableItem';
import { arrayMove } from '@dnd-kit/sortable';
import { Button } from 'antd';
import { useState } from 'react';
export default () => {
  const [data, setData] = useState([
    { id: '1', content: 'ha' },
    { id: '2', content: 'ho' },
  ]);
  return (
    <div>
      <DndContext
        onDragEnd={(e) => {
          const { active, over } = e;
          if (active.id != over?.id) {
            //交换数据
            console.log('active', active, over);
            const activeIndex = data.findIndex((i) => i.id === active.id);
            const overIndex = data.findIndex((i) => i.id === over?.id);
            const new_sort_data = arrayMove(data, activeIndex, overIndex);
            setData(new_sort_data);
          }
        }}
      >
        {data.map((d) => {
          return (
            <SortableItem key={d.id} id={d.id} eid={d.id}>
              <div style={{ width: 150, height: 150 }}>
                <DragHandler>
                  <Button>drag</Button>
                </DragHandler>
                <div>{d.content}</div>
              </div>
            </SortableItem>
          );
        })}
      </DndContext>
    </div>
  );
};
