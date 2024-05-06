import { SaContext } from '@/components/Sadmin/posts/table';
import { getTableColumns } from '@/components/Sadmin/posts/tableColumns';
import { ProCard } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Table } from 'antd';
import React, { useContext } from 'react';
import { DevPanelColumnTitle } from '../title';

const PanelItemTable: React.FC<{ [key: string]: any }> = (props) => {
  const { config, data, title, uid } = props;
  //console.log('table props', props);
  const { columns, ...retConfig } = config;
  const { initialState } = useModel('@@initialState');
  const {
    tableDesigner: { devEnable },
  } = useContext(SaContext);
  const devTitle = devEnable ? (
    <DevPanelColumnTitle
      otitle={null}
      uid={uid}
      col={props}
      devData={{ itemType: 'col' }}
      title={(title ? title : 'Table') + ' - ' + uid}
    />
  ) : title ? (
    title
  ) : (
    false
  );
  return (
    <ProCard style={{ height: '100%' }} title={devTitle}>
      <Table
        columns={getTableColumns({
          initRequest: true,
          columns: columns,
          initialState,
          devEnable: false,
        })}
        dataSource={data?.data}
        //title={title ? () => title : false}
        rowKey="id"
        {...retConfig}
      />
    </ProCard>
  );
};

export default PanelItemTable;
