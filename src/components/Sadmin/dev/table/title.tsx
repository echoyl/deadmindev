import request from '@/components/Sadmin/lib/request';
import {
  CopyOutlined,
  DeleteColumnOutlined,
  DragOutlined,
  EditOutlined,
  InsertRowBelowOutlined,
  InsertRowRightOutlined,
  MenuOutlined,
  PlusOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Space, Switch, theme } from 'antd';
import classNames from 'classnames';
import { FC, useContext, useEffect, useState } from 'react';
import { SaDevContext } from '..';
import Confirm from '../../action/confirm';
import ConfirmForm from '../../action/confirmForm';
import { getCustomerColumn } from '../../action/customerColumn/dev';
import { SaContext } from '../../posts/table';
import { DragHandler, SortableItem } from '../dnd-context/SortableItem';
import {
  devBaseFormFormColumns,
  devBaseTableFormColumns,
  getModelColumns,
  getModelRelations,
} from './baseFormColumns';
import { SchemaSettingsContext, SchemaSettingsDropdown } from './designer';
import { ColumnsSelector, ToolBarMenu } from './toolbar';
import { tplComplie } from '../../helpers';
import DevSwitch from '../switch';
import { getJson, isArr } from '../../checkers';
import { createStyles } from 'antd-style';
import FormCodePhp from '../formCodePhp';
import { DevJsonContext } from '../../jsonForm';
import type { GetProp, MenuProps } from 'antd';
export const useDesignerCss = createStyles(({ token }) => {
  return {
    saSortItem: {
      position: 'relative',
      minWidth: 60,
      '&:hover > .general-schema-designer': {
        display: 'block',
      },
      '& > .general-schema-designer': {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 999,
        display: 'none',
        background: 'rgba(22, 119, 255, 0.12) !important',
        //background: `${token.colorPrimaryBgHover} !important`,
        border: '0 !important',
        pointerEvents: 'none',
        '& > .general-schema-designer-icons': {
          position: 'absolute',
          top: 3,
          right: 2,
          lineHeight: '16px',
          pointerEvents: 'all',
          '& .ant-space-item': {
            alignSelf: 'stretch',
            width: 16,
            color: '#fff',
            lineHeight: '16px',
            textAlign: 'center',
            backgroundColor: token.colorPrimaryTextHover,
          },
        },
      },
    },
    overrideAntdCSS: {
      '& .ant-space-item .anticon': {
        margin: 0,
      },
      '&:hover': {
        display: 'block !important',
      },
    },
  };
});

const getValue = (uid, pageMenu, type) => {
  //无uid表示插入列
  if (!uid) {
    return {};
  }
  const config =
    type == 'table' || type == 'toolbar'
      ? pageMenu?.schema?.table_config
      : pageMenu?.schema?.form_config;
  const pconfig = getJson(config, []);
  if (type == 'table' || type == 'toolbar') {
    return pconfig?.find((v) => v.uid == uid);
  } else {
    //form获取组或列信息
    let value = {};
    //console.log('config', config);
    pconfig?.tabs?.map((tab) => {
      if (tab.uid == uid) {
        //tab支持编辑修改其属性
        value = tab;
      } else {
        tab.config?.map((group) => {
          if (group.uid == uid) {
            value = group;
          } else {
            group.columns?.map((column) => {
              if (column.uid == uid) {
                value = column;
              }
            });
          }
        });
      }
    });
    return value;
  }
};

const BaseForm = (props) => {
  const { title, uid, ctype, data, extpost, actionType = 'edit' } = props;
  const {
    tableDesigner: { pageMenu, reflush, editUrl = '', type = 'table' },
  } = useContext(SaContext);
  const { setting } = useContext(SaDevContext);

  const [value, setValue] = useState(data);
  const [columns, setColumns] = useState([]);
  const [columnsMore, setColumnsMore] = useState([]);

  const [relations, setRelations] = useState<any[]>([]);
  const [modelColumns, setModelColumns] = useState<any[]>([]);
  const { allMenus = [] } = setting?.adminSetting?.dev;
  useEffect(() => {
    setRelations(getModelRelations(pageMenu?.model_id, setting?.adminSetting?.dev));
    setModelColumns(getModelColumns(pageMenu?.model_id, setting?.adminSetting?.dev));
  }, []);
  const noMore = ctype == 'copyToMenu';
  const { json = {}, setJson } = useContext(DevJsonContext);

  useEffect(() => {
    //setValue(getValue(uid, pageMenu, ctype ? ctype : type));
    //setValue(data);
    if (actionType != 'add') {
      if (ctype == 'tabxx') {
        //not used
        setValue(data);
      } else {
        // console.log(
        //   'get value',
        //   uid,
        //   ctype,
        //   pageMenu,
        //   getValue(uid, pageMenu, ctype ? ctype : type),
        // );
        const pageMenuData =
          pageMenu && Object.keys(pageMenu)?.length > 0
            ? pageMenu
            : { schema: { form_config: json?.config?.form_config } };
        //console.log('pageMenuData', pageMenuData);
        setValue(getValue(uid, pageMenuData, ctype ? ctype : type));
      }
    }

    const columns =
      ctype == 'tab'
        ? [
            {
              title: 'title',
              dataIndex: ['tab', 'title'],
              colProps: { span: 24 },
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
            },
          ]
        : ctype == 'formGroup'
          ? [
              {
                title: 'title',
                dataIndex: ['props', 'title'],
                colProps: { span: 12 },
              },
            ]
          : ctype == 'copyToMenu'
            ? [
                {
                  valueType: 'group',
                  columns: [
                    {
                      dataIndex: ['props', 'toMenuId'],
                      title: '复制到',
                      valueType: 'treeSelect',
                      fieldProps: {
                        options: setting?.adminSetting?.dev?.allMenus,
                        treeLine: { showLeafIcon: true },
                        treeDefaultExpandAll: true,
                        showSearch: true,
                      },
                      colProps: { span: 12 },
                    },
                    {
                      dataIndex: ['props', 'type'],
                      title: '类型',
                      valueType: 'radioButton',
                      fieldProps: {
                        buttonStyle: 'solid',
                        defaultValue: 'updateOrInsert',
                        options: [
                          { label: '覆盖', value: 'updateOrInsert' },
                          { label: '新增', value: 'insert' },
                        ],
                      },
                      tooltip: '覆盖会删除原有的配置,新增不会检测是否之前有过记录，直接新增',
                      colProps: { span: 12 },
                    },
                  ],
                },
              ]
            : type == 'table'
              ? devBaseTableFormColumns({
                  model_id: pageMenu?.model_id,
                  dev: setting?.adminSetting?.dev,
                })
              : devBaseFormFormColumns({
                  model_id: pageMenu?.model_id,
                  dev: setting?.adminSetting?.dev,
                });

    setColumns(columns);
    noMore || setColumnsMore(getCustomerColumn(relations, allMenus, modelColumns));
    //console.log('base value is ', value, uid);
  }, [pageMenu, data, modelColumns]);
  //console.log('tableDesigner?.pageMenu', setTbColumns, getTableColumnsRender);
  //const value = getValue(uid, pageMenu, type);

  // const trigger = React.cloneElement(title, {
  //   key: 'trigger',
  //   ...title.props,
  //   onClick: async (e: any) => {
  //     setVisible?.(false);
  //     //e.preventDefault();
  //     console.log('clicked');
  //     e.stopPropagation();
  //   },
  // });
  return (
    <ConfirmForm
      trigger={<div style={{ width: '100%' }}>{title}</div>}
      tabs={[
        { title: '基础', formColumns: columns },
        !noMore ? { title: '更多', formColumns: columnsMore } : null,
      ].filter((v) => v)}
      value={value}
      postUrl={editUrl}
      data={{ id: pageMenu?.id, uid, ...extpost, ...json }}
      callback={({ data }) => {
        reflush(data);
        setJson?.(data?.data);
      }}
      saFormProps={{ devEnable: false }}
      width={1000}
    />
  );
};

export const DeleteColumn = (props) => {
  const { title, uid, extpost } = props;
  const { json = {}, setJson } = useContext(DevJsonContext);
  const {
    tableDesigner: { pageMenu, reflush, deleteUrl = '' },
  } = useContext(SaContext);
  return (
    <Confirm
      trigger={<div style={{ width: '100%' }}>{title}</div>}
      url={deleteUrl}
      data={{ base: { id: pageMenu?.id, uid, ...extpost, ...json } }}
      msg="确定要删除吗"
      callback={({ data }) => {
        reflush(data);
        setJson?.(data?.data);
        return true;
      }}
    />
  );
};

/**
 * form项快捷swtich操作 用于只读和必填
 * @param props
 * @returns
 */
const MenuItemSwtich = (props) => {
  const { title, uid, extpost, name } = props;
  const { json = {}, setJson } = useContext(DevJsonContext);
  const {
    tableDesigner: { pageMenu, reflush, editUrl = '' },
  } = useContext(SaContext);
  const [value, setValue] = useState<Record<string, any>>({});
  useEffect(() => {
    const pageMenuData =
      Object.keys(pageMenu)?.length > 0
        ? pageMenu
        : { schema: { form_config: json?.config?.form_config } };
    const value = getValue(uid, pageMenuData, 'form');
    setValue(value);
  }, [pageMenu]);

  const onChange = (checked: boolean) => {
    setValue({
      ...value,
      [name]: checked,
    });
    request
      .post(editUrl, {
        data: { base: { id: pageMenu?.id, uid, ...value, [name]: checked, ...json } },
      })
      .then(({ data, code }) => {
        if (code) {
          //失败后设置回去
          setValue({
            ...value,
            [name]: !checked,
          });
        } else {
          reflush(data);
          setJson?.(data.data);
        }
      });
  };
  return (
    <Switch
      checkedChildren={title}
      checked={value?.[name]}
      unCheckedChildren={title}
      onChange={onChange}
    />
  );
};

export const AddEmptyGroup = (props) => {
  const { title, uid, extpost } = props;
  const { json = {}, setJson } = useContext(DevJsonContext);
  const {
    tableDesigner: { pageMenu, reflush, editUrl = '' },
  } = useContext(SaContext);

  const add = async () => {
    const { data } = await request.post(editUrl, {
      data: { base: { id: pageMenu?.id, uid, ...extpost, ...json } },
    });
    reflush(data);
    setJson?.(data.data);
  };

  return (
    <div style={{ width: '100%' }} onClick={add}>
      {title}
    </div>
  );
};

const MenuLabel = (props) => {
  const { setVisible } = useContext(SchemaSettingsContext);
  return (
    <div
      onClick={(e) => {
        setVisible(false);
        e.stopPropagation(); //20250116 当工具栏是confirm时点击dev按钮时阻住继续冒泡
        //e.preventDefault();//20241012 - 这里去掉阻止冒泡 导致 checkbox点击label失效。忘记了为什么之前要加这个 记录下
      }}
    >
      {props?.children}
    </div>
  );
};

export const DevTableColumnTitle = (props) => {
  const { title, uid, devData, data, style = {} } = props;
  //console.log('title is title', title);
  //const designable = true;
  const { type } = devData;
  type ItemType = GetProp<MenuProps, 'items'>[number];
  const baseform: ItemType = {
    label: (
      <MenuLabel>
        <BaseForm
          title={
            <Space>
              <EditOutlined />
              <span>编辑</span>
            </Space>
          }
          uid={uid}
          ctype={type}
          data={data}
        />
      </MenuLabel>
    ),
    key: 'base',
  };
  const baseAddTab: ItemType = {
    label: (
      <MenuLabel>
        <BaseForm
          title={
            <Space>
              <EditOutlined />
              <span>+ Tab</span>
            </Space>
          }
          uid={uid}
          ctype={type}
          data={data}
          extpost={{ actionType: 'addTab' }}
        />
      </MenuLabel>
    ),
    key: 'addtab',
  };

  const addCol: ItemType = {
    label: (
      <MenuLabel>
        <BaseForm
          title={
            <Space>
              <InsertRowRightOutlined />
              <span>+ 列</span>
            </Space>
          }
          uid={uid}
          extpost={{ actionType: 'add' }}
          actionType="add"
        />
      </MenuLabel>
    ),
    key: 'addCol',
  };
  const copyToMenu: ItemType = {
    label: (
      <MenuLabel>
        <BaseForm
          title={
            <Space>
              <CopyOutlined />
              <span>复制</span>
            </Space>
          }
          uid={uid}
          ctype="copyToMenu"
          extpost={{ actionType: 'copyToMenu' }}
        />
      </MenuLabel>
    ),
    key: 'copyToMenu',
  };
  const addEmptyGroup: ItemType = {
    label: (
      <MenuLabel>
        <AddEmptyGroup
          title={
            <Space>
              <InsertRowBelowOutlined />
              <span>+ 行</span>
            </Space>
          }
          uid={uid}
          extpost={{ actionType: 'addGroup' }}
        />
      </MenuLabel>
    ),
    key: 'addEmptyGroup',
  };
  const deleteitem: ItemType = {
    label: (
      <MenuLabel>
        <DeleteColumn
          title={
            <Space>
              <DeleteColumnOutlined />
              <span>删除</span>
            </Space>
          }
          uid={uid}
        />
      </MenuLabel>
    ),
    key: 'deleteitem',
    danger: true,
  };
  const formItemReadOnly: ItemType = {
    label: <MenuItemSwtich name="readonly" title="只读" uid={uid} />,
    key: 'formItemReadOnly',
  };
  const formItemRequired: ItemType = {
    label: <MenuItemSwtich name="required" title="必填" uid={uid} />,
    key: 'formItemRequired',
  };

  const items: ItemType[] =
    type == 'tab'
      ? [
          baseform,
          baseAddTab,
          addEmptyGroup,
          copyToMenu,
          {
            type: 'divider',
          },

          deleteitem,
        ]
      : type == 'formGroup'
        ? [
            baseform,
            addCol,
            addEmptyGroup,
            copyToMenu,
            {
              type: 'divider',
            },

            deleteitem,
          ]
        : type == 'toolbar'
          ? [
              uid ? baseform : null,
              addCol,
              {
                type: 'divider',
              },
              deleteitem,
            ]
          : [
              baseform,
              addCol,
              copyToMenu,
              {
                type: 'divider',
              },
              deleteitem,
              type == 'form' ? formItemReadOnly : null,
              type == 'form' ? formItemRequired : null,
            ];
  //表单的话 加一个最小宽度
  const styles: Record<string, any> = {
    form: {
      minWidth: 80,
    },
    table: {},
    toolbar: { display: 'inline-block' },
  };
  const { styles: dstyles } = useDesignerCss();
  const { token } = theme.useToken();
  return (
    <SortableItem
      className={dstyles.saSortItem}
      id={uid}
      eid={uid}
      devData={devData}
      style={{ ...styles[devData?.type], ...style }}
    >
      <div className={classNames('general-schema-designer', dstyles.overrideAntdCSS)}>
        <div className={'general-schema-designer-icons'}>
          <Space size={3} align={'center'}>
            <SchemaSettingsDropdown
              title={
                <DragHandler>
                  <MenuOutlined
                    role="button"
                    style={{ cursor: 'pointer' }}
                    aria-label={'drag-handler'}
                    title="右键菜单，长按拖动排序"
                  />
                </DragHandler>
              }
              items={items}
            />
          </Space>
        </div>
      </div>
      <div role="button">
        {title ? tplComplie(title) : 'dev'}
        <span style={{ color: token.colorTextTertiary, fontWeight: 'normal', paddingLeft: 6 }}>
          {isArr(props?.dataIndex) ? props?.dataIndex.join('.') : props?.dataIndex}
        </span>
      </div>
    </SortableItem>
  );
};
export const AddTabItem = (props) => {
  return (
    <BaseForm
      title={<Button type="text" icon={<PlusOutlined />} title="添加Tab" />}
      ctype="tab"
      extpost={{ actionType: 'addTab' }}
    />
  );
};

export const FormAddTab = (props) => {
  const { pageMenu, marginTop = 16 } = props;
  const { initialState, setInitialState } = useModel('@@initialState');
  return (
    <Space style={{ marginTop }}>
      <ColumnsSelector
        key="devcolumns"
        trigger={<Button icon={<UnorderedListOutlined />} />}
        dev={initialState?.settings?.adminSetting?.dev}
      />
      <ToolBarMenu
        key="devsetting"
        trigger={<Button icon={<SettingOutlined />} />}
        pageMenu={pageMenu}
      />
      <DevSwitch key="DevSwitch" type="button" />
      <FormCodePhp key="FormCodePhp" pageMenu={pageMenu} />
    </Space>
  );
};

const DevContain = (props) => {
  const { children, title } = props;
  const { initialState } = useModel('@@initialState');
  const dev = initialState?.settings?.adminSetting?.dev ? true : false;
  return dev ? <>{children}</> : title;
};

export const TableColumnTitle: FC = (props) => {
  return (
    <DevContain {...props}>
      <DevTableColumnTitle {...props} devData={{ type: 'table' }} />
    </DevContain>
  );
};
export const FormColumnTitle: FC = (props) => {
  const title = props.valueType == 'group' && !props.title ? [props.uid].join(' - ') : props.title;
  const devType = props.valueType == 'group' ? 'formGroup' : 'form';
  return (
    <DevContain {...props}>
      <DevTableColumnTitle {...props} title={title} devData={{ type: devType }} />
    </DevContain>
  );
};

export const ToolbarColumnTitle: FC = (props) => {
  return (
    <DevContain {...props}>
      <DevTableColumnTitle {...props} devData={{ type: 'toolbar' }} />
    </DevContain>
  );
};

export const TabColumnTitle: FC = (props) => {
  return (
    <DevContain {...props}>
      <DevTableColumnTitle {...props} devData={{ type: 'tab' }} />
    </DevContain>
  );
};
