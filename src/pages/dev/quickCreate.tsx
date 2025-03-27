import ConfirmForm from '@/components/Sadmin/action/confirmForm';
import { inArray } from '@/components/Sadmin/checkers';
import { saReload } from '@/components/Sadmin/components/refresh';
import { SaDevContext } from '@/components/Sadmin/dev';
import { tplComplie } from '@/components/Sadmin/helpers';
import { SaContext } from '@/components/Sadmin/posts/table';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button } from 'antd';
import { FC, useContext } from 'react';
interface SaReord {
  [key: string]: any;
}
const QuickCreate: FC<{ menus: SaReord; models: SaReord; foldermodels: SaReord }> = (props) => {
  const { menus, models, foldermodels } = props;
  const { initialState, setInitialState } = useModel('@@initialState');
  const { setSetting } = useContext(SaDevContext);
  const { actionRef } = useContext(SaContext);

  const reload = async () => {
    await saReload(initialState, setInitialState, setSetting);
    return;
  };
  return (
    <ConfirmForm
      key="quick_button"
      trigger={
        <Button key="quick_button" icon={<ThunderboltOutlined />}>
          快速创建
        </Button>
      }
      msg="快速创建内容模块"
      value={{}}
      saFormProps={{ devEnable: false }}
      formColumns={[
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'type',
              title: '类型',
              colProps: { span: 12 },
              valueType: 'select',
              fieldProps: {
                options: [
                  { label: '内容模块', value: 'posts' },
                  { label: '后台用户', value: 'perm' },
                  { label: '门店', value: 'shop' },
                  { label: '商品', value: 'goods' },
                  { label: '订单', value: 'order' },
                  { label: '普通用户', value: 'user' },
                ],
              },
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: '类型为必填',
                  },
                ],
              },
            },
            {
              valueType: 'dependency',
              name: ['type'],
              columns: ({ type }) => {
                if (inArray(type, ['posts', 'shop', 'goods']) > -1) {
                  return [
                    {
                      title: '指定已有分类模型',
                      dataIndex: 'category_id',
                      valueType: 'treeSelect',
                      fieldProps: {
                        options: models,
                        treeLine: { showLeafIcon: true },
                        treeDefaultExpandAll: true,
                        placeholder: '不选择的自动创建新的分类模型',
                      },
                      colProps: { span: 12 },
                    },
                  ];
                }
                if (inArray(type, ['order']) > -1) {
                  return [
                    {
                      title: '指定商品模型',
                      dataIndex: 'goods_id',
                      valueType: 'treeSelect',
                      fieldProps: {
                        options: models,
                        treeLine: { showLeafIcon: true },
                        treeDefaultExpandAll: true,
                        placeholder: '必选',
                      },
                      formItemProps: {
                        rules: [{ required: true, message: '商品模型为必填' }],
                      },
                      colProps: { span: 12 },
                    },
                    {
                      title: '用户模型',
                      dataIndex: 'user_id',
                      valueType: 'treeSelect',
                      fieldProps: {
                        options: models,
                        treeLine: { showLeafIcon: true },
                        treeDefaultExpandAll: true,
                        placeholder: '不选择则不关联用户信息',
                      },
                      colProps: { span: 12 },
                    },
                  ];
                }
                return [];
              },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'title',
              title: '内容名称',
              colProps: { span: 12 },
            },
            {
              dataIndex: 'name',
              title: '路径名称',
              colProps: { span: 12 },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'model_to_id',
              colProps: { span: 12 },
              title: '模型创建到',
              valueType: 'treeSelect',
              fieldProps: {
                options: foldermodels,
                treeLine: { showLeafIcon: true },
                treeDefaultExpandAll: true,
                placeholder: '不选择的话创建到根',
              },
            },
            {
              dataIndex: 'menu_to_id',
              colProps: { span: 12 },
              title: '菜单创建到',
              valueType: 'treeSelect',
              fieldProps: {
                options: menus,
                treeLine: { showLeafIcon: true },
                treeDefaultExpandAll: true,
                placeholder: '不选择的话创建到根',
                treeTitleRender: (item) => {
                  return item ? (item.label ? tplComplie(item.label) : item.label) : '-';
                },
              },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'category_level',
              title: '分类层级',
              fieldProps: {
                defaultValue: 1,
              },
              valueType: 'digit',
              colProps: { span: 12 },
            },
            {
              dataIndex: 'category_type',
              title: '分类类型',
              colProps: { span: 12 },
              valueType: 'radioButton',
              fieldProps: {
                defaultValue: 'single',
                options: [
                  { label: '单选', value: 'single' },
                  { label: '多选', value: 'multiple' },
                ],
              },
            },
          ],
        },
      ]}
      url="dev/model/quickCreate"
      callback={(ret) => {
        //location.reload();
        if (!ret) {
          return;
        }
        if (!ret.code) {
          reload();
          //location.reload();
          actionRef?.current?.reload();
        }
      }}
    />
  );
};

export default QuickCreate;
