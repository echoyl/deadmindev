import React, { useState } from 'react';
import './style.less';
import type { saTableProps } from './table';
import SaTable from './table';
import { PageContainer404 } from '@/components/Sadmin/404';
type CategoryProps = {
  expandAll?: boolean;
} & saTableProps;

const Category: React.FC<CategoryProps> = (props) => {
  //console.log(url);
  const [ekeys, setEkeys] = useState<number[]>([]);
  const { tableProps: tp = {} } = props;
  const { tableTitle = false, expandAll = true, setting = {}, path } = props;
  const { fold, level } = setting;
  const defaultProps = {
    level: 1,
    openType: 'drawer',
    tableColumns: ['displayorder', 'option'],
    formColumns: ['parent_id'],
    expandAll: fold ? false : true,
    ...props,
  };
  if (level) {
    defaultProps.level = level;
  }
  //console.log('props', props);

  const tableProps = {
    search: false,
    columnsState: {
      persistenceKey: 'pro-table-singe-demos',
      persistenceType: 'localStorage',
    },
    pagination: false,
    dateFormatter: 'string',
    expandable: {
      expandedRowKeys: ekeys,
      onExpand: (is, record) => {
        if (is) {
          ekeys.push(record.id);
          setEkeys(ekeys);
        } else {
          const index = ekeys.findIndex((k) => k == record.id);
          if (index > -1) {
            ekeys.splice(index, 1);
            setEkeys(ekeys);
          }
        }
      },
    },
    ...tp,
  };

  return (
    <PageContainer404 title={tableTitle} path={path}>
      <SaTable
        {...defaultProps}
        beforeTableGet={(ret) => {
          const keys: number[] = [];
          const render = (sdata: any[], t_level: number = 0) => {
            //console.log(sdata);
            sdata.forEach((item) => {
              item._level = t_level;
              if (item.children) {
                //console.log(item.id);
                keys.push(item.id);
                render(item.children, t_level + 1);
              }
            });
          };
          render(ret.data);
          //console.log(keys);
          if (expandAll && !fold) {
            setEkeys(keys);
          }
          if (props.beforeTableGet) {
            props.beforeTableGet(ret);
          }
        }}
        tableProps={tableProps}
      />
    </PageContainer404>
  );
};

export default Category;
