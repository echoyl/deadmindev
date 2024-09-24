import TranslationModal from '@/components/Sadmin/dev/form/translation';
import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { SaForm } from '@/components/Sadmin/posts/post';
import { ProCard, ProFormInstance } from '@ant-design/pro-components';
import { Space } from 'antd';
import { useState, useRef } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  //console.log('dev setting', setting);

  // const path = [
  //   [39.98481500648338, 116.30571126937866],
  //   [39.982266575222155, 116.30596876144409],
  //   [39.982348784165886, 116.3111400604248],
  //   [39.978813710266024, 116.3111400604248],
  //   [39.978813710266024, 116.31699800491333],
  // ];
  const columns: saFormColumnsType = [
    {
      title: '标题',
      dataIndex: 'title',
      fieldProps: { localesopen: 1 },
    },
  ];
  return (
    <ProCard>
      <SaForm
        msgcls={({ data }) => {
          console.log(data);
        }}
        width={800}
        pageType="page"
        tabs={[
          {
            title: 'base',
            formColumns: columns,
            // formColumns: [
            //   {
            //     title: (
            //       <Space>
            //         <span>标题</span> <TranslationModal />
            //       </Space>
            //     ),
            //     dataIndex: 'title',
            //   },
            //   {
            //     dataIndex: 'title_en-US',
            //     formItemProps: { hidden: true },
            //   },
            // ],
          },
        ]}
      />

      <span>test</span>
    </ProCard>
  );
}
