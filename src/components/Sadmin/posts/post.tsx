import request from '@/components/Sadmin/lib/request';
import {
  FooterToolbar,
  ProCard,
  ProForm,
  ProFormInstance,
  StepsForm,
} from '@ant-design/pro-components';
//import { PageContainer } from '@ant-design/pro-layout';
import { history, useIntl, useModel, useParams, useSearchParams } from '@umijs/max';
import { Col, GetProps, Row, Space, Tabs } from 'antd';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import { SaDevContext } from '../dev';
import { DndContext } from '../dev/dnd-context';
import { useTableDesigner } from '../dev/table/designer';
import { FormAddTab, TabColumnTitle } from '../dev/table/title';

import { PageContainer404 } from '@/components/Sadmin/404';
import { isUndefined } from 'es-toolkit';
import { beforeGet, beforePost, getFormFieldColumns, GetFormFields } from './formDom';
import { SaContext, saTableProps } from './table';

export interface saFormProps extends saTableProps {
  msgcls?: (value: { [key: string]: any }) => void; //提交数据后的 回调
  submitter?: string;
  showTabs?: boolean;
  align?: 'center' | 'left'; //表单对齐位置 center居中显示
  dataId?: number;
  readonly?: boolean;
  postUrl?: string; //post url 如果传入后不再使用url提交数据
  width?: number;
  afterPost?: (ret: any) => void;
  onTabChange?: (index: string) => void; //tab切换后的回调
  resetForm?: boolean; //提交数据后 是否重置表单
  grid?: boolean; //form是否开启grid布局
  tabsProps?: GetProps<typeof Tabs>;
}

export const SaForm: FC<saFormProps> = (props) => {
  const {
    url = '',
    postUrl,
    formColumns,
    labels = {},
    // tabs = [
    //   {
    //     tab: { title: '基础信息' },
    //     formColumns: props.formColumns ? cloneDeep(props.formColumns) : [],
    //   },
    // ],
    tabs,
    msgcls = ({ code }) => {
      if (!code) {
        history.back();
      }
    },
    submitter = 'toolbar',
    paramExtra = {},
    postExtra = {},
    showTabs = true,
    align = 'center',
    editable = true, //是否可编辑 用于判断编辑状态下是否可以出现提交按钮
    addable = true, //是否可以新增
    readonly = false, //是否可新增 用户 添加状态下是否出现提交按钮
    dataId = 0, //用户判断是编辑还是新增，通过网络请求有一定的延迟 还是通过参数判断
    actionRef,
    pageType = 'page',
    width = 800,
    formRef = useRef<ProFormInstance<any>>({} as any),
    onTabChange,
    setting,
    resetForm = false,
    pageMenu: oPageMenu,
    grid = true,
    devEnable: pdevEnable = true,
  } = props;
  //console.log('init props', props);
  //const url = 'posts/posts';
  //读取后台数据
  const [pageMenu, setPageMenu] = useState(oPageMenu);
  const [detail, setDetail] = useState<{ [key: string]: any } | boolean>(
    props.formProps?.initialValues ? props.formProps?.initialValues : false,
  );
  const [_formColumns, setFormColumns] = useState<any[]>([]);
  const { initialState } = useModel('@@initialState');
  const [devEnable, setDevEnable] = useState(
    pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.adminSetting?.dev,
  );
  const { messageApi, setting: devSetting, isMobile } = useContext(SaDevContext);
  const intl = useIntl();
  //提交数据
  const post = async (base: any, callback?: (value: any) => void, then?: any) => {
    //log('post data is ', base);
    //console.log('ppst data ', base);
    const postTo = postUrl ? postUrl : url.replace('/show', '');
    if (!postTo) {
      //无url模式直接返回结构
      msgcls?.({ code: 0, data: base });
      return true;
    }

    const postBase = { ...base };
    _formColumns.map((cl) => {
      beforePost(postBase, cl);
    });

    if (props.beforePost) {
      if (props.beforePost(postBase) === false) {
        return;
      }
    }

    return request
      .post(postTo, {
        data: { base: { ...postExtra, ...postBase } },
        msgcls: callback ? callback : msgcls,
        then,
        messageApi,
      })
      .then((ret) => {
        props.afterPost?.(ret);

        if (setting?.steps_form) {
        } else {
          //console.log('re set data', ret.data, formRef?.current);
          //setDetail({ ...ret.data });
          if ((resetForm || pageType == 'page') && !ret.code) {
            //当强制刷新form 或者页面类型是page时，且请求成功时，重置表单
            formRef?.current?.resetFields();
            //formRef?.current?.setFieldsValue({});
            formRef?.current?.setFieldsValue({ ...ret.data });
          }
        }
      });
  };

  const params = { ...useParams(), ...paramExtra };

  const [search] = useSearchParams();
  const query = search.toString();
  if (query) {
    query.split('&').map((v) => {
      let [key, value] = v.split('=');
      params[key] = value;
    });
  }
  params['*'] && delete params['*'];

  //获取数据
  //console.log('post params', params, url);
  const get = async () => {
    // if (!url && isObj(detail) && Object.keys(detail).length == 0) {
    //   //console.log('form get no request', url, detail);
    //   return {};
    // }
    if (props.formProps?.initialValues || !url || url.replace('/show', '') == '') {
      //有初始化值 则不请求后台数据
      const ndetail = props.formProps?.initialValues ? props.formProps?.initialValues : {};
      //console.log('ndetail', ndetail);
      setDetail({ ...ndetail });
      return { ...ndetail };
    }
    const { data } = await request.get(url, { params, drawer: pageType == 'drawer' });
    beforeGet(data);
    if (props.beforeGet) {
      props.beforeGet(data);
    }
    //console.log('post get data ', data);
    setDetail(data);
    return data;
  };
  const getFormColumnsRender = (tabs) => {
    return tabs?.map((tab) => {
      return getFormFieldColumns({
        detail,
        labels,
        initRequest: true,
        columns: tab.formColumns,
        user: initialState?.currentUser,
        devEnable,
        intl,
        devSetting,
        isMobile,
        variant:setting?.form?.variant || 'filled'
      });
    });
  };
  useEffect(() => {
    setDevEnable(
      pdevEnable &&
        !initialState?.settings?.devDisable &&
        initialState?.settings?.adminSetting?.dev,
    );
  }, [initialState?.settings?.devDisable]);
  useEffect(() => {
    if (!detail && url) {
      return;
    }
    //tabs不能设置默认值 不然这里会一直执行

    if (isUndefined(tabs)) {
      const defaultTabs = formColumns
        ? [
            {
              tab: { title: '基础信息' },
              formColumns: formColumns ? formColumns : [],
            },
          ]
        : [];
      //console.log('form has changed here', defaultTabs, detail);
      setFormColumns(getFormColumnsRender(defaultTabs));
    } else {
      setFormColumns(getFormColumnsRender(tabs));
    }
  }, [detail, formColumns, tabs, devEnable]);
  //const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    if (setting?.steps_form) {
      //如果是分步表单 手动请求request 同样设置一个 formRef
      get().then((data) => {
        //console.log('get data', data);
        formMapRef?.current?.forEach((formInstanceRef, findex) => {
          formInstanceRef?.current?.setFieldsValue(data);
        });
      });
    }
  }, []);
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const [stepFormCurrent, setStepFormCurrent] = useState<number>(0);

  const tableDesigner = useTableDesigner({
    pageMenu,
    setPageMenu,
    setColumns: setFormColumns,
    getColumnsRender: getFormColumnsRender,
    type: 'form',
    devEnable,
  });

  return (
    <SaContext.Provider
      value={{
        formRef: setting?.steps_form ? formMapRef?.current[0] : formRef,
        actionRef,
        tableDesigner,
        detail,
        columnData: detail,
      }}
    >
      <DndContext>
        {initialState?.settings?.adminSetting?.dev && pdevEnable && !showTabs && !devEnable ? (
          <FormAddTab pageMenu={pageMenu} style={pageType != 'page' ? { marginTop: 16 } : {}} />
        ) : null}
        {setting?.steps_form ? (
          <StepsForm
            current={stepFormCurrent}
            onCurrentChange={(current) => {
              setStepFormCurrent(current);
            }}
            formMapRef={formMapRef}
            onFinish={async (values) => {
              //console.log(values);
              //message.success('提交成功');
              //提交操作 让分步表单中最后一步 接管
              //return Promise.resolve(true);
            }}
            formProps={{
              validateMessages: {
                required: '此项为必填项',
              },
            }}
          >
            {tabs?.map((cl, index) => {
              //console.log('cl', cl);
              return (
                <StepsForm.StepForm
                  key={index}
                  name={'step_' + index}
                  title={cl.title ? cl.title : cl.tab?.title}
                  onFinish={async () => {
                    //每一步都将之前的表单信息提交到url
                    let data = { step_index: index };
                    formMapRef?.current?.forEach((formInstanceRef) => {
                      data = { ...data, ...formInstanceRef?.current?.getFieldsFormatValue() };
                    });
                    return post(
                      data,
                      index + 1 == tabs.length ? undefined : () => null,
                      index + 1 == tabs.length ? undefined : () => {},
                    ).then(({ code, data, msg }) => {
                      //将传回的数据又重新赋值一遍
                      if (code) {
                        messageApi.error(msg);
                        return false;
                      }
                      if (index + 1 == tabs.length) {
                        //最后一步 重置表单
                        setStepFormCurrent(0);
                        formMapRef?.current?.forEach((formInstanceRef) => {
                          formInstanceRef?.current?.resetFields();
                        });
                      }
                      formMapRef?.current?.forEach((formInstanceRef) => {
                        formInstanceRef?.current?.setFieldsValue(data);
                      });

                      return true;
                    });
                  }}
                  style={pageType == 'page' ? { margin: 'auto', maxWidth: width } : {}}
                >
                  {_formColumns[index] ? <GetFormFields columns={_formColumns[index]} /> : null}
                </StepsForm.StepForm>
              );
            })}
          </StepsForm>
        ) : (
          <ProForm
            key="ProForm"
            form={props.form}
            formRef={formRef}
            variant="filled"
            style={pageType == 'page' ? { margin: 'auto', maxWidth: width } : {}}
            //style={pageType == 'page' ? { maxWidth: 688 } : {}}
            //layout="vertical"
            //layout="horizontal"
            //labelCol={{ lg: { span: 7 }, sm: { span: 7 } }}
            //wrapperCol={{ lg: { span: 10 }, sm: { span: 17 } }}
            //initialValues={detail}
            grid={grid}
            rowProps={{
              gutter: [0, 0],
            }}
            onFinish={post}
            request={get}
            submitter={
              (!editable && dataId != 0) ||
              (dataId == 0 && !addable) ||
              (dataId == 0 && readonly) ||
              params.readonly == 1
                ? false
                : {
                    render: (props, dom) => {
                      return submitter == 'toolbar' ? (
                        <FooterToolbar>{dom}</FooterToolbar>
                      ) : submitter == 'dom' ? (
                        dom
                      ) : (
                        <Row>
                          <Col span={7} offset={0}>
                            <Space>{dom}</Space>
                          </Col>
                        </Row>
                      );
                    },
                  }
            }
            validateMessages={{
              required: '此项为必填项',
            }}
            {...props.formProps}
            {...setting?.form}
          >
            {showTabs || devEnable ? (
              <Tabs
                style={{ width: '100%' }}
                //defaultActiveKey="0"
                // centered={true}
                tabBarExtraContent={
                  initialState?.settings?.adminSetting?.dev && pdevEnable
                    ? {
                        right: (
                          <>
                            <FormAddTab pageMenu={pageMenu} type="formTab" />
                          </>
                        ),
                      }
                    : null
                }
                onChange={(activeKey) => {
                  onTabChange?.(activeKey);
                }}
                items={_formColumns.map((cl, index) => {
                  const thistab = tabs ? tabs[index] : {};
                  const label = tabs
                    ? tabs[index]?.title
                      ? tabs[index]?.title
                      : tabs[index]?.tab?.title
                    : '基础信息';
                  return {
                    label: devEnable ? <TabColumnTitle uid={thistab?.uid} title={label} /> : label,
                    key: thistab?.uid ? thistab?.uid : index + '', //key为字符串 如果是数字造成tab过多后点击切换失败的bug
                    children: <GetFormFields columns={cl} />,
                    forceRender: true, //如果关闭，其它tab的数据不会传输
                    ...tabs?.[index]?.tab?.props,
                  };
                })}
                {...props.tabsProps}
              />
            ) : (
              _formColumns.map((cl, index) => {
                if (index == 0) return <GetFormFields key={index} columns={cl} />;
              })
            )}
          </ProForm>
        )}
      </DndContext>
    </SaContext.Provider>
  );
};

const PostsForm: FC<saFormProps & { match?: boolean }> = (props) => {
  //console.log('post pros',props);
  const { formTitle = '详情', match = false, path } = props;
  //console.log(value?.breadcrumb);
  return (
    <PageContainer404 title={formTitle} match={match} path={path}>
      <ProCard variant="borderless">
        <SaForm {...props} />
      </ProCard>
    </PageContainer404>
  );
};

export default PostsForm;
