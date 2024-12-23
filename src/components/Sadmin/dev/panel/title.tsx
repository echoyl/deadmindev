import {
  DeleteColumnOutlined,
  DragOutlined,
  EditOutlined,
  InsertRowRightOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { Space } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { SaDevContext } from '..';
import ConfirmForm from '../../action/confirmForm';
import { SaContext } from '../../posts/table';
import { DragHandler, SortableItem } from '../dnd-context/SortableItem';
import { SchemaSettingsContext, SchemaSettingsDropdown } from '../table/designer';
import { DeleteColumn, useDesignerCss } from '../table/title';
import baseFormColumns, { baseRowColumns } from './vars/base';

const BaseForm = (props) => {
  const { title, uid, data, type = 'col', extpost } = props;
  const {
    tableDesigner: { pageMenu, reflush, editUrl, sourceData },
  } = useContext(SaContext);
  const { setting } = useContext(SaDevContext);
  const { setVisible } = useContext(SchemaSettingsContext);

  const [value, setValue] = useState({});
  useEffect(() => {
    setValue(data);
    //console.log('base value is ', value, uid);
  }, [pageMenu, data]);
  //console.log('tableDesigner?.pageMenu', setTbColumns, getTableColumnsRender);
  //const value = getValue(uid, pageMenu, type);
  //console.log('sourceData', sourceData);

  return (
    <div
      onClick={(e) => {
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
        tabs={type == 'col' ? baseFormColumns(sourceData) : baseRowColumns(sourceData)}
        value={value}
        postUrl={editUrl}
        data={{ id: pageMenu?.id, uid, ...extpost }}
        callback={({ data }) => {
          reflush(data);
          return true;
        }}
        saFormProps={{ devEnable: false }}
      />
    </div>
  );
};

export const DevPanelColumnTitle = (props) => {
  const { title, uid, devData, col, row, otitle, style } = props;
  //console.log('title is title', title);
  //const designable = true;
  const { itemType = 'row' } = devData;
  const {
    tableDesigner: { devEnable },
  } = useContext(SaContext);
  const addCol = (level = 0) => {
    return {
      label: (
        <BaseForm
          title={
            <Space>
              {level == 0 ? <PlusOutlined /> : <InsertRowRightOutlined />}
              <span>+ 列</span>
            </Space>
          }
          uid={uid}
          extpost={{ actionType: level == 0 ? 'insertCol' : 'addCol' }}
        />
      ),
      key: 'addCol' + level,
    };
  };
  const addRow = (level = 0) => {
    return {
      label: (
        <BaseForm
          title={
            <Space>
              {level == 0 ? <PlusOutlined /> : <InsertRowRightOutlined />}
              <span>+ 行</span>
            </Space>
          }
          uid={uid}
          type="row"
          extpost={{ actionType: level == 0 ? 'insertRow' : 'addRow' }}
        />
      ),
      key: 'addRow' + level,
    };
  };
  const editRow = {
    label: (
      <BaseForm
        title={
          <Space>
            <EditOutlined />
            <span>编辑</span>
          </Space>
        }
        uid={uid}
        data={row}
        type="row"
        extpost={{ actionType: 'editRow' }}
      />
    ),
    key: 'editRow',
  };
  const editCol = {
    label: (
      <BaseForm
        title={
          <Space>
            <EditOutlined />
            <span>编辑</span>
          </Space>
        }
        uid={uid}
        data={col}
        type="col"
        extpost={{ actionType: 'editCol' }}
      />
    ),
    key: 'editCol',
  };
  const deleteItem = (type) => {
    return {
      label: (
        <DeleteColumn
          title={
            <Space>
              <DeleteColumnOutlined />
              <span>删除</span>
            </Space>
          }
          uid={uid}
          extpost={{ actionType: type == 'col' ? 'deleteCol' : 'deleteRow' }}
        />
      ),
      key: 'deleteItem',
      danger: true,
    };
  };
  const items: ItemType[] =
    itemType == 'row'
      ? [
          editRow,
          addCol(0),
          {
            type: 'divider',
          },
          addRow(1),
          {
            type: 'divider',
          },
          deleteItem('row'),
        ]
      : [
          editCol,
          addRow(0),
          {
            type: 'divider',
          },
          addCol(1),
          {
            type: 'divider',
          },
          deleteItem('col'),
        ];
  const { styles } = useDesignerCss();
  return devEnable ? (
    <SortableItem
      className={styles.saSortItem}
      id={uid}
      eid={uid}
      devData={{ type: 'panel', ...devData }}
      style={style}
    >
      <div className={classNames('general-schema-designer', styles.overrideAntdCSS)}>
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
      <div role="button">{title}</div>
    </SortableItem>
  ) : otitle ? (
    <>{otitle}</>
  ) : null;
};
