import type { saFormColumnsType } from '@/components/Sadmin/helpers';
import { t } from '@/components/Sadmin/helpers';
import { SaForm } from '@/components/Sadmin/posts/post';
import { useIntl } from '@umijs/max';
import { Button } from 'antd';
import { useContext } from 'react';
import ButtonDrawer from '../../action/buttonDrawer';
import { SaContext } from '../../posts/table';

export default (props: any) => {
  const { pageMenu = { model_id: 0 }, trigger } = props;
  const columns: saFormColumnsType = [
    {
      title: '生成数量',
      dataIndex: 'count',
      valueType: 'digit',
      fieldProps: {
        defaultValue: 200,
      },
    },
    {
      title: '模型字段列表',
      dataIndex: 'columns',
      valueType: 'formList',
      rowProps: {
        gutter: 0,
      },
      fieldProps: {
        //arrowSort: true,
        //96 = 88 + 8px为 action的宽度
        // containerStyle: {
        //   width: 'calc(100% - 96px)',
        // },
        actionRender: () => <></>,
        creatorButtonProps: false,
      },
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: 'title',
              dataIndex: 'title',
              colProps: { span: 3 },
              readonly: true,
            },
            {
              title: 'name',
              dataIndex: 'name',
              colProps: { span: 3 },
              readonly: true,
            },
            {
              title: 'form_type',
              dataIndex: 'form_type',
              colProps: { span: 3 },
              readonly: true,
            },
            // {
            //   title: 'Icon',
            //   dataIndex: 'icon',
            //   valueType: 'iconSelect',
            //   colProps: { span: 6 },
            // },
            // {
            //   title: 'Color',
            //   dataIndex: 'color',
            //   valueType: 'colorPicker',
            //   colProps: { span: 4 },
            // },
            {
              title: '数据类型',
              dataIndex: 'fake_type',
              valueType: 'select',
              colProps: { span: 6 },
              fieldProps: {
                options: [
                  { label: 'text - 文本', value: 'text' },
                  { label: 'content - 内容', value: 'content' },
                  { label: 'address - 地址', value: 'address' },
                  { label: 'name - 姓名', value: 'username' },
                  { label: 'company - 公司', value: 'company' },
                  { label: 'phoneNumber - 电话', value: 'phoneNumber' },
                  { label: 'randomNumber - 随机数', value: 'randomNumber' },
                  { label: 'randomStr - 随机字符串', value: 'randomStr' },
                  { label: 'password - 密码', value: 'password' },
                ],
                showSearch: true,
              },
            },
            {
              title: '选项',
              dataIndex: 'fake_options',
              colProps: { span: 9 },
              fieldProps: {
                placeholder: '多个选项或区间使用英文逗号分隔',
              },
            },
          ],
        },
      ],
    },
  ];
  const intl = useIntl();
  const model_id = pageMenu.model_id;
  const DrawerForm = (mprops: any) => {
    const { contentRender, setOpen } = mprops;
    const { actionRef } = useContext(SaContext);
    return (
      <SaForm
        msgcls={({ data }) => {
          setOpen(false);
          actionRef?.current?.reload();
          return;
        }}
        pageType="drawer"
        grid={true}
        devEnable={false}
        url="dev/model/fakeData"
        dataId={model_id}
        paramExtra={{ id: model_id }}
        postExtra={{ id: model_id }}
        tabs={[
          {
            title: 'Fake data',
            formColumns: columns,
          },
        ]}
        formProps={{
          contentRender,
          submitter: {
            //移除默认的重置按钮，点击重置按钮后会重新请求一次request
            render: (props, doms) => {
              return [
                <Button key="rest" type="default" onClick={() => setOpen?.(false)}>
                  {t('cancel')}
                </Button>,
                doms[1],
              ];
            },
          },
        }}
      />
    );
  };

  return (
    <ButtonDrawer
      trigger={trigger}
      width={1200}
      title={t('data', intl)}
      drawerProps={{ styles: { body: { paddingTop: 8 } } }}
    >
      <DrawerForm />
    </ButtonDrawer>
  );
};
