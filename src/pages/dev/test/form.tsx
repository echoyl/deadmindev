import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { SaForm } from '@/components/Sadmin/posts/post';
import { Card } from 'antd';

export default () => {
  const columns: saFormColumnsType = [
    {
      title: '模型字段列表',
      dataIndex: 'columns',
      valueType: 'formList',
      rowProps: {
        gutter: 0,
      },
      fieldProps: {
        // transform: (data) => {
        //   return formListFormatDateValue(
        //     data,
        //     columns.find((c) => c.dataIndex === 'columns')?.columns,
        //   );
        // },
      },
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: 'time1',
              dataIndex: 'time1',
              colProps: { span: 3 },
              valueType: 'time',
            },
            {
              title: 'time',
              dataIndex: 'time',
              colProps: { span: 3 },
              valueType: 'time',
              fieldProps: {
                format: 'HH:mm',
              },
            },
            {
              title: 'date',
              dataIndex: 'date',
              colProps: { span: 3 },
              valueType: 'date',
            },
            {
              title: 'datetime',
              dataIndex: 'datetime',
              colProps: { span: 3 },
              valueType: 'dateTime',
            },
            {
              title: 'dateYear',
              dataIndex: 'dateYear',
              colProps: { span: 3 },
              valueType: 'dateYear',
            },
            {
              title: 'dateQuarter',
              dataIndex: 'dateQuarter',
              colProps: { span: 3 },
              valueType: 'dateQuarter',
            },
            {
              title: 'dateMonth',
              dataIndex: 'dateMonth',
              colProps: { span: 3 },
              valueType: 'dateMonth',
            },
            {
              title: 'dateWeek',
              dataIndex: 'dateWeek',
              colProps: { span: 3 },
              valueType: 'dateWeek',
            },
          ],
        },
      ],
    },
  ];
  return (
    <Card style={{ width: 1200 }}>
      <SaForm
        msgcls={({ data }) => {
          console.log(data);
        }}
        width={1200}
        pageType="page"
        grid={true}
        devEnable={false}
        //url="dev/model/fakeData"
        dataId={10038}
        paramExtra={{ id: 10038 }}
        postExtra={{ id: 10038 }}
        tabs={[
          {
            title: 'Fake data 生成',
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
