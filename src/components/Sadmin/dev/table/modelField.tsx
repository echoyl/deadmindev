import { useIntl } from '@umijs/max';
import { Button } from 'antd';
import { useContext } from 'react';
import { SaDevContext } from '..';
import { SaPageContext } from '../../404';
import ButtonDrawer from '../../action/buttonDrawer';
import { saReloadModel } from '../../components/refresh';
import { t } from '../../helpers';
import { SaForm } from '../../posts/post';
import { fieldColumn } from '../vars/model/fieldColumns';

export const ModelFieldForm = (mprops) => {
  const { contentRender, setOpen, modelId } = mprops;
  const intl = useIntl();
  const { setDevData } = useContext(SaDevContext);
  return (
    <SaForm
      tabs={[
        {
          tab: { title: t('baseInfo', intl) },
          formColumns: [
            fieldColumn,
            {
              title: '提交后',
              dataIndex: 'afterPostOptions',
              valueType: 'checkbox',
              tooltip: '勾选后自动创建或更新数据库表，在变更字段时使用',
              fieldProps: {
                options: [
                  { label: '生成表', value: 'createModelSchema' },
                  { label: '删除多余字段', value: 'dropColumns' },
                ],
                defaultValue: ['createModelSchema', 'dropColumns'],
              },
            },
          ],
        },
      ]}
      url="dev/model/show"
      dataId={modelId}
      paramExtra={{ id: modelId }}
      postExtra={{ id: modelId }}
      grid={true}
      devEnable={false}
      msgcls={({ code, data }) => {
        setOpen(false);
        if (!code) {
          saReloadModel({ setDevData }, data);
        }
      }}
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
      pageType="drawer"
    />
  );
};

export default (props: any) => {
  const { trigger, modelId = 0 } = props;
  const { pageMenu = { model_id: 0 } } = useContext(SaPageContext);
  const model_id = modelId || pageMenu?.model_id;
  const intl = useIntl();

  return (
    <ButtonDrawer
      trigger={trigger}
      width={1500}
      title={t('columns', intl)}
      drawerProps={{ styles: { body: { paddingTop: 8 } } }}
    >
      <ModelFieldForm modelId={model_id} />
    </ButtonDrawer>
  );
};
