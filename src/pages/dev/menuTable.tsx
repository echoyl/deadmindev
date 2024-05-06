import { SaDevContext } from '@/components/Sadmin/dev';
import { devBaseTableColumns } from '@/components/Sadmin/dev/table/baseFormColumns';
import { SaForm } from '@/components/Sadmin/posts/post';
import { ProFormInstance } from '@ant-design/pro-components';
import { useContext, useEffect, useRef, useState } from 'react';

export default (props) => {
  const { model, setOpen, actionRef, contentRender } = props;
  const [columns, setColumns] = useState<any[]>();
  const { setting } = useContext(SaDevContext);
  useEffect(() => {
    setColumns(devBaseTableColumns({ model_id: model.admin_model_id, dev: setting?.dev }));
  }, []);

  const cascaderColumns = (data) => {
    if (!data.admin_model) {
      return;
    }

    const oldModelColumns = data.admin_model.columns;

    if (!data.table_config) {
      data.table_config = oldModelColumns.map((v) => {
        return { key: v.name };
      });
      data.table_config.push({ key: 'option' });
    }

    return;
  };

  const formRef = useRef<ProFormInstance>();
  return (
    <SaForm
      beforeGet={(data) => {
        cascaderColumns(data);
      }}
      msgcls={({ code }) => {
        if (!code) {
          console.log('loading dispear here');
          setOpen(false);
          actionRef.current?.reload();
          return;
        }
      }}
      formColumns={[
        'id',
        {
          dataIndex: 'table_config',
          valueType: 'saFormList',
          fieldProps: { showtype: 'table' },
          columns,
        },
      ]}
      formRef={formRef}
      paramExtra={{ id: model?.id }}
      url="dev/menu/show"
      postUrl="dev/menu/tableConfig"
      showTabs={false}
      formProps={{
        contentRender,
        submitter: {
          searchConfig: { resetText: '取消' },
          resetButtonProps: {
            onClick: () => {
              setOpen(false);
            },
          },
        },
      }}
      align="left"
      dataId={model.id}
      pageType="drawer"
      grid={false}
      devEnable={false}
    />
  );
};
