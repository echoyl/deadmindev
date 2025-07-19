import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { SaForm } from '@/components/Sadmin/posts/post';
import { Badge, Card } from 'antd';

export default () => {
  const columns: saFormColumnsType = [
    {
      title: 'json可选数据',
      dataIndex: 'json',
      valueType: 'formList',
      rowProps: {
        gutter: 0,
      },
      fieldProps: {
        arrowSort: true,
        //96 = 88 + 8px为 action的宽度
        containerStyle: {
          width: 'calc(100% - 96px)',
        },
      },
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: 'Value - id',
              dataIndex: 'id',
              colProps: { span: 6 },
            },
            {
              title: 'Label - title',
              dataIndex: 'title',
              colProps: { span: 6 },
            },
            {
              title: 'Icon',
              dataIndex: 'icon',
              valueType: 'iconSelect',
              colProps: { span: 6 },
            },
            // {
            //   title: 'Color',
            //   dataIndex: 'color',
            //   valueType: 'colorPicker',
            //   colProps: { span: 4 },
            // },
            {
              title: 'Badge',
              dataIndex: 'status',
              valueType: 'select',
              colProps: { span: 6 },
              fieldProps: {
                options: [
                  { label: <Badge status="success" />, value: 'success' },
                  { label: <Badge status="error" />, value: 'error' },
                  { label: <Badge status="processing" />, value: 'processing' },
                  { label: <Badge status="warning" />, value: 'warning' },
                  { label: <Badge status="default" />, value: 'default' },
                ],
              },
            },
          ],
        },
      ],
    },
  ];
  return (
    <Card style={{ width: 600 }}>
      <SaForm
        msgcls={({ data }) => {
          console.log(data);
        }}
        width={600}
        pageType="page"
        grid={true}
        devEnable={false}
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
    </Card>
  );
};
