import request from '@/services/ant-design-pro/sadmin';
import {
  DeleteColumnOutlined,
  DragOutlined,
  EditOutlined,
  InsertRowRightOutlined,
  MenuOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { useModel } from '@umijs/max';
import { Button, Space } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
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
import { ToolBarMenu } from './toolbar';
export const designerCss = css`
  position: relative;
  min-width: 60px;
  &:hover {
    > .general-schema-designer {
      display: block;
    }
  }
  > .general-schema-designer {
    position: absolute;
    top: 0;
    /*top: -16px !important;*/
    right: 0;
    /*right: -16px !important;*/
    bottom: 0;
    /*bottom: -16px !important;*/
    left: 0;
    /*left: -16px !important;*/
    z-index: 999;
    display: none;
    background: rgba(241, 139, 98, 0.12) !important;
    border: 0 !important;
    pointer-events: none;
    > .general-schema-designer-icons {
      position: absolute;
      top: 2px;
      right: 2px;
      line-height: 16px;
      pointer-events: all;
      .ant-space-item {
        align-self: stretch;
        width: 16px;
        color: #fff;
        line-height: 16px;
        text-align: center;
        background-color: rgb(241, 139, 98);
      }
    }
  }
`;

const overrideAntdCSS = css`
  & .ant-space-item .anticon {
    margin: 0;
  }

  &:hover {
    display: block !important;
  }
`;

const getValue = (uid, pageMenu, type) => {
  //无uid表示插入列
  if (!uid) {
    return {};
  }
  const config =
    type == 'table' || type == 'toolbar'
      ? pageMenu?.schema?.table_config
      : pageMenu?.schema?.form_config;
  if (type == 'table' || type == 'toolbar') {
    return JSON.parse(config)?.find((v) => v.uid == uid);
  } else {
    //form获取组或列信息
    let value = {};
    //console.log('config', config);
    JSON.parse(config)?.tabs?.map((tab) => {
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
    });
    return value;
  }
};

const BaseForm = (props) => {
  const { title, uid = '', ctype, data, extpost, actionType = 'edit' } = props;
  const {
    tableDesigner: { pageMenu, reflush, editUrl = '', type = 'table' },
  } = useContext(SaContext);
  const { setting } = useContext(SaDevContext);
  const { setVisible } = uid ? useContext(SchemaSettingsContext) : { setVisible: undefined };

  const [value, setValue] = useState(data);
  const [columns, setColumns] = useState([]);
  const [columnsMore, setColumnsMore] = useState([]);

  const [relations, setRelations] = useState<any[]>([]);
  const [modelColumns, setModelColumns] = useState<any[]>([]);
  const { allMenus = [] } = setting?.dev;
  useEffect(() => {
    setRelations(getModelRelations(pageMenu?.model_id, setting?.dev));
    setModelColumns(getModelColumns(pageMenu?.model_id, setting?.dev));
  }, []);
  //console.log('title pageMenu is', pageMenu);
  useEffect(() => {
    //setValue(getValue(uid, pageMenu, ctype ? ctype : type));
    //setValue(data);
    if (actionType != 'add') {
      if (ctype == 'tab') {
        setValue(data);
      } else {
        // console.log(
        //   'get value',
        //   uid,
        //   ctype,
        //   pageMenu,
        //   getValue(uid, pageMenu, ctype ? ctype : type),
        // );
        setValue(getValue(uid, pageMenu, ctype ? ctype : type));
      }
    }

    const columns =
      ctype == 'tab'
        ? [
            {
              title: 'title',
              dataIndex: ['tab', 'title'],
              colProps: { span: 12 },
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
        : type == 'table'
        ? devBaseTableFormColumns({
            model_id: pageMenu?.model_id,
            dev: setting?.dev,
          })
        : devBaseFormFormColumns({
            model_id: pageMenu?.model_id,
            dev: setting?.dev,
          });

    setColumns(columns);
    setColumnsMore(getCustomerColumn(relations, allMenus, modelColumns));
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
    <div
      onClick={(e) => {
        //e.preventDefault();
        e.preventDefault();
      }}
    >
      <ConfirmForm
        trigger={
          <div
            style={{ width: '100%' }}
            onClick={(e) => {
              setVisible?.(false);
            }}
          >
            {title}
          </div>
        }
        tabs={[
          { title: '基础', formColumns: columns },
          { title: '更多', formColumns: columnsMore },
        ]}
        value={value}
        postUrl={editUrl}
        data={{ id: pageMenu?.id, uid, ...extpost }}
        callback={({ data }) => {
          reflush(data);
        }}
        saFormProps={{ devEnable: false }}
        width={1000}
      />
    </div>
  );
};

export const DeleteColumn = (props) => {
  const { title, uid, extpost } = props;
  const {
    tableDesigner: { pageMenu, reflush, deleteUrl = '' },
  } = useContext(SaContext);
  const { setVisible } = useContext(SchemaSettingsContext);
  // const trigger = React.cloneElement(title, {
  //   key: 'trigger',
  //   ...title.props,
  //   onClick: async (e: any) => {
  //     setVisible(false);
  //     e.preventDefault();
  //     //e.stopPropagation();
  //   },
  // });
  return (
    <Confirm
      trigger={
        <div
          style={{ width: '100%' }}
          onClick={(e) => {
            setVisible(false);
            //e.stopPropagation();
            //e.preventDefault();
          }}
        >
          {title}
        </div>
      }
      url={deleteUrl}
      data={{ base: { id: pageMenu?.id, uid, ...extpost } }}
      msg="确定要删除吗"
      callback={({ data }) => {
        reflush(data);
        return true;
      }}
    />
  );
};
export const AddEmptyGroup = (props) => {
  const { title, uid, extpost } = props;
  const {
    tableDesigner: { pageMenu, reflush, editUrl = '' },
  } = useContext(SaContext);
  const { setVisible } = useContext(SchemaSettingsContext);

  const add = async () => {
    const { data } = await request.post(editUrl, {
      data: { base: { id: pageMenu?.id, uid, ...extpost } },
    });
    reflush(data);
  };

  return (
    <div style={{ width: '100%' }} onClick={add}>
      {title}
    </div>
  );
};

export const DevTableColumnTitle = (props) => {
  const { title, uid, devData, data } = props;
  //console.log('title is title', title);
  //const designable = true;
  const { type } = devData;
  const baseform: ItemType = {
    label: (
      <BaseForm
        title={
          <Space>
            <EditOutlined />
            <span>设置</span>
          </Space>
        }
        uid={uid}
        ctype={type}
        data={data}
      />
    ),
    key: 'base',
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
    },
  };
  const baseAddTab: ItemType = {
    label: (
      <BaseForm
        title={
          <Space>
            <EditOutlined />
            <span>向后插入Tab</span>
          </Space>
        }
        uid={uid}
        ctype={type}
        extpost={{ actionType: 'addTab' }}
      />
    ),
    key: 'addtab',
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
    },
  };

  const addCol: ItemType = {
    label: (
      <BaseForm
        title={
          <Space>
            <InsertRowRightOutlined />
            <span>插入列</span>
          </Space>
        }
        uid={uid}
        extpost={{ actionType: 'add' }}
        actionType="add"
      />
    ),
    key: 'addCol',
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
    },
  };
  const addGroup: ItemType = {
    label: (
      <BaseForm
        title={
          <Space>
            <InsertRowRightOutlined />
            <span>插入组</span>
          </Space>
        }
        uid={uid}
        ctype="formGroup"
        extpost={{ actionType: 'addGroup' }}
      />
    ),
    key: 'addGroup',
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
    },
  };
  const addEmptyGroup: ItemType = {
    label: (
      <AddEmptyGroup
        title={
          <Space>
            <InsertRowRightOutlined />
            <span>快速插入组</span>
          </Space>
        }
        uid={uid}
        extpost={{ actionType: 'addGroup' }}
      />
    ),
    key: 'addEmptyGroup',
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
    },
  };
  const deleteitem: ItemType = {
    label: (
      <DeleteColumn
        title={
          <Space>
            <DeleteColumnOutlined />
            <span>删除</span>
          </Space>
        }
        uid={uid}
      />
    ),
    key: 'deleteitem',
    danger: true,
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
    },
  };

  const items: ItemType[] =
    type == 'tab'
      ? [
          baseform,
          baseAddTab,
          addEmptyGroup,
          {
            type: 'divider',
          },

          deleteitem,
        ]
      : type == 'formGroup'
      ? [
          baseform,
          addCol,
          addGroup,
          addEmptyGroup,
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
          {
            type: 'divider',
          },
          deleteitem,
        ];
  //表单的话 加一个最小宽度
  const styles = {
    form: {
      minWidth: 80,
    },
    table: {},
    toolbar: { display: 'inline-block' },
  };
  return (
    <SortableItem
      className={designerCss}
      id={uid}
      eid={uid}
      devData={devData}
      style={styles[devData?.type]}
    >
      <div className={classNames('general-schema-designer', overrideAntdCSS)}>
        <div className={'general-schema-designer-icons'}>
          <Space size={3} align={'center'}>
            <DragHandler>
              <DragOutlined role="button" aria-label={'drag-handler'} />
            </DragHandler>
            <SchemaSettingsDropdown
              title={<MenuOutlined role="button" style={{ cursor: 'pointer' }} />}
              items={items}
            />
          </Space>
        </div>
      </div>
      <div role="button">{title ? title : 'dev'}</div>
    </SortableItem>
  );
};

export const FormAddTab = (props) => {
  const { pageMenu } = props;
  return (
    <Space>
      <BaseForm
        title={
          <Button type="dashed">
            <span> + Tab</span>
          </Button>
        }
        ctype="tab"
        extpost={{ actionType: 'addTab' }}
      />
      <ToolBarMenu
        key="devsetting"
        trigger={
          <Button type="dashed" danger>
            <SettingOutlined />
          </Button>
        }
        pageMenu={pageMenu}
      />
    </Space>
  );
};

export const TableColumnTitle: FC = (props) => {
  const { initialState } = useModel('@@initialState');
  const dev = initialState?.settings?.dev ? true : false;
  return dev ? <DevTableColumnTitle {...props} devData={{ type: 'table' }} /> : <>{props.title}</>;
};
export const FormColumnTitle: FC = (props) => {
  const { initialState } = useModel('@@initialState');
  const dev = initialState?.settings?.dev ? true : false;

  const title =
    props.valueType == 'group' && !props.title ? ['分组', props.uid].join(' - ') : props.title;
  const devType = props.valueType == 'group' ? 'formGroup' : 'form';
  return dev ? (
    <DevTableColumnTitle {...props} title={title} devData={{ type: devType }} />
  ) : (
    props.title
  );
};

export const ToolbarColumnTitle: FC = (props) => {
  const { initialState } = useModel('@@initialState');
  const dev = initialState?.settings?.dev ? true : false;
  return dev ? (
    <DevTableColumnTitle {...props} devData={{ type: 'toolbar' }} />
  ) : (
    <>{props.title}</>
  );
};

export const TabColumnTitle: FC = (props) => {
  const { initialState } = useModel('@@initialState');
  const dev = initialState?.settings?.dev ? true : false;
  return dev ? <DevTableColumnTitle {...props} devData={{ type: 'tab' }} /> : <>{props.title}</>;
};
