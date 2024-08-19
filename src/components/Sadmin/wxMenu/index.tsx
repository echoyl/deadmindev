import { CloseCircleOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { ProCard, ProForm, ProFormDependency, ProFormText } from '@ant-design/pro-components';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { css } from '@emotion/css';
import { Button, Divider, Form, Popover, Select, Space, theme } from 'antd';
import React, { useEffect, useState } from 'react';
import ButtonModal from '../action/buttonModal';
import { inArray } from '../checkers';
import { uid } from '../helpers';

export interface wxMenu {
  name?: string;
  uid: string;
  type?: string;
  key?: string;
  sub_button?: wxMenu[];
}

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  item: wxMenu;
}

const DraggableUploadListItem = ({ originNode, item }: DraggableUploadListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.uid,
  });
  const commonStyle = {
    cursor: 'move',
    transition: 'unset', // Prevent element from shaking after drag
    height: '100%',
    ...originNode?.props?.style,
  };
  // const style: React.CSSProperties = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };
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
  return React.cloneElement(originNode, {
    ...attributes,
    ...listeners,
    className,
    style,
    ref: setNodeRef,
  });
  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {/* hide error tooltip when dragging */}
      {originNode}
    </div>
  );
};

export const SecondMenu: React.FC<{
  data?: wxMenu[];
  onChange?: (v: wxMenu[]) => void;
  menuSelect?: (menu: wxMenu) => void;
  selected?: boolean; //当前formmenu
}> = (props) => {
  const { data, onChange, menuSelect, selected = false } = props;
  const [menus, setMenus] = useState<wxMenu[]>([]);
  const [thisMenu, setThisMenu] = useState<wxMenu>();
  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });
  const menuMaxLength = 5;

  useEffect(() => {
    if (data) {
      setMenus(data);
    }
  }, [data]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = menus.findIndex((i) => i.uid === active.id);
      const overIndex = menus.findIndex((i) => i.uid === over?.id);
      const new_sort_data = arrayMove(menus, activeIndex, overIndex);
      changeMenu(new_sort_data);
    }
  };
  const addMenu = () => {
    const ad_menu = {
      name: '新增菜单',
      uid: uid(),
    };
    menus.unshift(ad_menu);
    changeMenu(menus);
    menuSelect?.(ad_menu);
    setThisMenu(ad_menu);
  };

  const closeMenu = (index: number) => {
    menus.splice(index, 1);
    changeMenu(menus);
    //关闭后选中第一
    if (menus.length > 0) {
      menuSelect?.(menus[0]);
      setThisMenu(menus[0]);
    }
  };

  const changeMenu = (d: wxMenu[]) => {
    setMenus([...d]);
    //顺序变化
    onChange?.([...d]);
  };
  return (
    <div style={{ textAlign: 'center', width: 126 }}>
      <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
        <SortableContext
          items={menus.map((i) => i.uid)}
          //strategy={horizontalListSortingStrategy}
        >
          {menus.length < menuMaxLength ? (
            <Button type="text" onClick={addMenu} icon={<PlusOutlined />} />
          ) : null}
          {menus.length > 0 &&
            menus.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <DraggableUploadListItem
                    originNode={
                      <div style={{ width: '100%' }}>
                        <div
                          style={{
                            background: !selected && thisMenu?.uid == item.uid ? '#eee' : 'none',
                            padding: '12px 0',
                          }}
                        >
                          <Space
                            style={{
                              margin: '0 auto',
                            }}
                          >
                            <span
                              onClick={() => {
                                menuSelect?.(item);
                                setThisMenu(item);
                              }}
                            >
                              {item.name}
                            </span>
                            <CloseCircleOutlined
                              onClick={() => {
                                closeMenu(index);
                              }}
                            />
                          </Space>
                        </div>
                      </div>
                    }
                    item={item}
                  />
                  {index < menus.length - 1 ? <Divider style={{ margin: '6px 0' }} /> : null}
                </React.Fragment>
              );
            })}
        </SortableContext>
      </DndContext>
    </div>
  );
};

const FormPanel: React.FC<{
  menu?: wxMenu & { sub_button?: Array<wxMenu> };
  onChange?: (value: any) => void;
}> = ({ menu, onChange }) => {
  const [form] = Form.useForm();
  const onValuesChange = (value: any, allvalues: any) => {
    // if (value.name) {
    //   if (value.name.length > 5) {
    //     return;
    //   }
    // }
    // console.log('valuechange', value, allvalues);
    // form.submit();
    onFinish(allvalues);
  };
  const onFinish = (values: FormData) => {
    //const fieldsValue = formRef.current?.getFieldsValue();
    menu = { uid: menu?.uid as string, sub_button: menu?.sub_button, ...values };
    onChange?.(menu);
    return Promise.resolve();
  };
  // useEffect(()=>{

  // },[menu?.sub_button])
  const types = [
    {
      label: '网页类型',
      value: 'view',
    },
    {
      label: '小程序',
      value: 'miniprogram',
    },
    {
      label: '点击事件',
      value: 'click',
    },
  ];
  const formTailLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 24, offset: 0 },
  };
  return menu ? (
    <ProForm
      onFinish={onFinish}
      form={form}
      request={async (params) => {
        return menu;
      }}
      onValuesChange={onValuesChange}
      {...formTailLayout}
      submitter={false}
    >
      <ProFormText
        key="name"
        label="菜单名称"
        name="name"
        required
        rules={[
          {
            max: 5,
          },
        ]}
        // onChange={() => {
        //   form.submit();
        // }}
      />
      {(!menu.sub_button || menu.sub_button.length < 1) && (
        <>
          <ProForm.Item key="type" label="类型" name="type" required>
            <Select options={types} />
          </ProForm.Item>
          <ProFormDependency key="dependency" name={['type']}>
            {({ type }) => {
              const ret = [];
              if (inArray(type, ['view', 'miniprogram']) > -1) {
                ret.push(<ProFormText key="url" label="链接地址" name="url" required />);
              }
              if (inArray(type, ['miniprogram']) > -1) {
                ret.push(<ProFormText key="appid" label="小程序appid" name="appid" required />);
                ret.push(
                  <ProFormText key="pagepath" label="小程序页面地址" name="pagepath" required />,
                );
              }
              if (inArray(type, ['click']) > -1) {
                ret.push(<ProFormText key="key" label="关键字" name="key" required />);
              }
              return ret;
            }}
          </ProFormDependency>
        </>
      )}
    </ProForm>
  ) : null;
};

const WxMenu: React.FC<{
  value?: wxMenu[];
  onChange?: (v: any) => void;
}> = ({ value = [], onChange }) => {
  const [menus, setMenus] = useState<wxMenu[]>(value);
  const [formMenu, setFormMenu] = useState<wxMenu>();
  const [thisMenu, setThisMenu] = useState<wxMenu | null>(menus?.[0]);
  const [selected, setSelected] = useState(false);
  const { useToken } = theme;
  const { token } = useToken();
  const menuMaxLength = 3;
  const addMenu = () => {
    const ad_menu = {
      name: '新增菜单',
      uid: uid(),
      sub_button: [],
    };
    menus.push(ad_menu);
    setMenus([...menus]);
    clickMenu(ad_menu);
  };
  const closeMenu = (index: number) => {
    menus.splice(index, 1);
    changeMenu(menus);
    if (menus.length > 0) {
      clickMenu(menus[0]);
    }
  };
  const clickMenu = (menu: wxMenu) => {
    setFormMenu(menu);
    setThisMenu(menu);
  };
  const changeMenu = (d: wxMenu[]) => {
    setMenus([...d]);
    onChange?.([...d]);
    //顺序变化
    //onChange?.([...d]);
  };
  const formChange = (menu: wxMenu) => {
    //console.log('formChange', menu);
    menus.forEach((v, i) => {
      if (v.uid == menu.uid) {
        menus[i] = menu;
      } else {
        //console.log('inner find', v);
        if (v.sub_button) {
          //console.log('inner find', v.sub_button);
          v.sub_button.forEach((vv, ii) => {
            if (vv.uid == menu.uid) {
              //console.log('inner find', vv);
              menus[i].sub_button[ii] = menu;
            }
          });
        }
      }
    });
    //menus[index] = menu;
    setFormMenu(menu);
    changeMenu(menus);
  };

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const activeIndex = menus.findIndex((i) => i.uid === active.id);
    if (active.id !== over?.id) {
      const overIndex = menus.findIndex((i) => i.uid === over?.id);
      const new_sort_data = arrayMove(menus, activeIndex, overIndex);
      changeMenu(new_sort_data);
    }
    setSelected(true);
    setThisMenu(menus[activeIndex]);
  };

  return (
    <ProCard split="vertical">
      <ProCard style={{ paddingTop: 440, background: token.colorBgLayout }} colSpan={15} key="menupanel">
        {/* <SecondMenu
    data={sm}
    onChange={(v) => {
      console.log('子菜单顺序变化', v);
    }}
  /> */}
        <DndContext
          sensors={[sensor]}
          onDragEnd={onDragEnd}
          onDragStart={() => {
            setSelected(false);
            setThisMenu(null);
          }}
        >
          <SortableContext
            items={menus?.map((i) => i.uid)}
            //strategy={horizontalListSortingStrategy}
          >
            {menus?.map((item, index) => {
              return (
                <React.Fragment key={item.uid}>
                  <DraggableUploadListItem
                    originNode={
                      <div style={{ display: 'inline-block' }}>
                        <Popover
                          content={
                            <SecondMenu
                              data={item.sub_button}
                              menuSelect={(menu) => {
                                setFormMenu(menu);
                                setSelected(false);
                              }}
                              onChange={(smenu) => {
                                //二级菜单更新
                                item.sub_button = smenu;
                                changeMenu(menus);
                              }}
                              selected={selected}
                            />
                          }
                          trigger="click"
                          placement="top"
                          open={thisMenu && item.uid == thisMenu.uid ? true : false}
                        >
                          <Button
                            type={thisMenu?.uid == item.uid ? 'dashed ' : 'text'}
                            style={{ width: 150 }}
                            onClick={() => {
                              clickMenu(item);
                              setSelected(true);
                            }}
                          >
                            <Space>
                              {item.name}
                              <CloseCircleOutlined
                                onClick={(e) => {
                                  closeMenu(index);
                                  e.stopPropagation();
                                }}
                              />
                            </Space>
                          </Button>
                        </Popover>
                      </div>
                    }
                    item={item}
                  />

                  {index < menus.length - 1 ? <Divider type="vertical" /> : null}
                </React.Fragment>
              );
            })}
          </SortableContext>
        </DndContext>
        {menus?.length < menuMaxLength ? (
          <>
            {menus?.length > 0 ? <Divider type="vertical" /> : null}
            <Button type="dashed" onClick={addMenu}>
              +
            </Button>
          </>
        ) : null}
      </ProCard>

      <ProCard colSpan={9} title="菜单设置" key="showpanel">
        <FormPanel key={formMenu?.uid} menu={formMenu} onChange={formChange} />
      </ProCard>
    </ProCard>
  );
};

/**
 * form中不能嵌套form 所以将菜单编辑放入modal中
 * @param props
 * @returns
 */
export const WxMenuModal = (props) => {
  const [value, setValue] = useState();
  //当点击确认的时候才修改值
  return (
    <ButtonModal
      trigger={
        <Button icon={<MenuOutlined />} type="dashed">
          配置自定义菜单
        </Button>
      }
      title="配置自定义菜单"
      width={1000}
      formFooter={false}
      onOk={() => {
        console.log('ok submit', value);
        props?.onChange?.([...value]);
        return true;
      }}
    >
      <WxMenu
        value={props.value ? [...props.value] : []}
        onChange={(v) => {
          //console.log('just on change', v);
          setValue([...v]);
        }}
      />
    </ButtonModal>
  );
};

export const wxMenuRender = (text, props) => {
  //console.log(props);
  return <WxMenuModal {...props.fieldProps} />;
};

export default WxMenu;
