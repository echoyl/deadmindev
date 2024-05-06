import { SaDevContext } from '@/components/Sadmin/dev';
import modelSettingColumns from '@/components/Sadmin/dev/vars/modelSettingColumns';
import PostsForm from '@/components/Sadmin/posts/post';
import { useContext } from 'react';

export default function App() {
  const { setting } = useContext(SaDevContext);
  console.log('dev setting', setting);
  return (
    <PostsForm
      formProps={{
        initialValues: {
          id: 10029,
        },
      }}
      devEnable={false}
      msgcls={(ret) => {
        console.log(ret);
      }}
      tabs={[
        {
          title: 'test',
          formColumns: (detail) => {
            return [
              {
                title: '设置',
                dataIndex: 'setting',
                valueType: 'confirmForm',

                fieldProps: {
                  btn: {
                    title: '设置',
                    size: 'middle',
                  },
                  tabs: modelSettingColumns(detail.id, setting?.dev),
                  saFormProps: { devEnable: false, grid: false },
                },
              },
            ];
          },
        },
      ]}
    />
  );
}
