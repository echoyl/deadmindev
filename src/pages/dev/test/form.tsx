import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { SaForm } from '@/components/Sadmin/posts/post';

export default () => {
  const columns: saFormColumnsType = [
    {
      title: '标题',
      dataIndex: 'saSlider',
      valueType: 'saSlider',
      fieldProps: { localesopen: 1 },
    },
  ];
  return (
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
  );
};
