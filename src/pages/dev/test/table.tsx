import SaTable from '@/components/Sadmin/posts/table';
export default () => {
  return (
    <SaTable
      url="example/news/news"
      tableColumns={[
        { dataIndex: 'title', title: 'title' },
        {
          dataIndex: 'range',
          title: 'range',
          valueType: 'saSlider',
          fieldProps: {
            min: 100,
            max: 200,
          },
        },
      ]}
    />
  );
};
