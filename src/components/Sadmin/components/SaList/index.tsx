import { ProList } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import CoverItem, { DevItem } from './coverItem';
// const data = [
//   '语雀的天空',
//   'Ant Design',
//   '蚂蚁金服体验科技',
//   'TechUI',
//   'TechUI 2.0',
//   'Bigfish',
//   'Umi',
//   'Ant Design Pro',
// ].map((item) => ({
//   title: item,
//   subTitle: <Tag color="#5BD8A6">语雀专栏</Tag>,
//   actions: [<a key="run">邀请</a>, <a key="delete">删除</a>],
//   avatar: 'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png',
//   subDescription: '希望是一个好东西，也许是最好的，好东西是不会消亡的',
//   content: (
//     <Typography.Paragraph
//       ellipsis={{
//         rows: 3,
//       }}
//     >
//       在中台产品的研发过程中，会出现不同的设计规范和实现方式，但其中往往存在很多类似的页面和组件，这些类似的组件会被抽离成一套标准规范。
//     </Typography.Paragraph>
//   ),
//   updatedAt: 1728455356987,
// }));

const SaList: React.FC<any> = (props) => {
  const { tableColumns, devEnable, allProps, ...restProps } = props;
  const { columns } = restProps;
  const [metas, setMetas] = useState<Record<string, any>>();
  const [itemColumns, setItemColumns] = useState();
  const {
    setting: { card: { grid: { gutter = 16, column = 6 } = {} } = {} },
  } = allProps;
  useEffect(() => {
    setItemColumns(
      tableColumns?.filter((v) => {
        return !v.hideInTable;
      }),
    );
  }, []);

  useEffect(() => {
    if (!columns || columns.length < 1) {
      return;
    }
    const mts: Record<string, any> = {};
    columns?.map((v) => {
      mts[v.dataIndex] = v;
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
      onItem={(record, index) => {
        return {
          onClick: () => {
            console.log(record, index);
          },
        };
      }}
      renderItem={(item, index) => {
        return (
          <CoverItem
            record={item}
            tableColumns={itemColumns}
            index={index}
            devEnable={devEnable}
            allProps={allProps}
          />
        );
      }}
    />
  );
};

export default SaList;
