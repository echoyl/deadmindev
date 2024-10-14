import { ProList } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import CoverItem from './coverItem';
import { List } from 'antd';

const SaList: React.FC<any> = (props) => {
  const { tableColumns, devEnable, allProps, ...restProps } = props;
  const { columns } = restProps;
  const [metas, setMetas] = useState<Record<string, any>>();
  const {
    setting: { card: { grid: { gutter = 16, column = 6 } = {} } = {} },
  } = allProps;

  useEffect(() => {
    if (!columns || columns.length < 1) {
      return;
    }
    const mts: Record<string, any> = {};
    columns?.map((v) => {
      if (!mts[v.dataIndex]) {
        //优先只设置第一个
        mts[v.dataIndex] = v;
      }
      return v;
    });
    //console.log('tableColumns', columns, mts, tableColumns, devEnable);
    setMetas(mts);
  }, [devEnable, columns]);

  return (
    <ProList<any>
      {...restProps}
      grid={{ gutter, column }}
      metas={metas}
      itemCardProps={{
        ghost: true,
      }}
      renderItem={(item, index) => {
        return (
          <List.Item>
            <CoverItem
              record={item}
              tableColumns={columns?.filter((v) => {
                return !v.hideInTable;
              })}
              index={index}
              devEnable={devEnable}
              allProps={allProps}
            />
          </List.Item>
        );
      }}
    />
  );
};

export default SaList;
