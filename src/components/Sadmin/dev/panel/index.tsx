import request, { messageLoadingKey } from '@/services/ant-design-pro/sadmin';
import { SettingOutlined } from '@ant-design/icons';
import { BetaSchemaForm, PageContainer, ProCard } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Col, Flex, Row, Skeleton, Space, Tabs } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { saConfig } from '../../config';
import { SaBreadcrumbRender, tplComplie } from '../../helpers';
import { PagePanelHeader } from '../../pagePanel';
import { getFormFieldColumns } from '../../posts/formDom';
import { SaContext } from '../../posts/table';
import { DndContext } from '../dnd-context';
import { useTableDesigner } from '../table/designer';
import { ToolBarMenu } from '../table/toolbar';
import PanelItemCard from './items/card';
import PanelItemTable from './items/table';
import { DevPanelColumnTitle } from './title';
import { SaDevContext } from '..';

const ItemCol = (props) => {
  const {
    span,
    title,
    uid,
    rows,
    data,
    config,
    sourceDataName,
    chart,
    noTitle = false,
    height,
    type,
    getData,
    show_condition: showCondition,
  } = props;

  const idata = data?.find((v) => v.value == sourceDataName);
  const {
    tableDesigner: { devEnable },
  } = useContext(SaContext);
  const { initialState } = useModel('@@initialState');
  const show =
    showCondition && !devEnable
      ? tplComplie(showCondition, { user: initialState?.currentUser })
      : true;
  //console.log('ItemCol', props, data);
  const ctitle = (_title = '') => {
    return noTitle ? null : (
      <DevPanelColumnTitle
        otitle={_title ? _title : title}
        title={(_title ? _title : title ? title : '元素') + ' - ' + uid}
        uid={uid}
        col={props}
        devData={{ itemType: 'col' }}
      />
    );
  };
  //console.log('cititle', ctitle);
  const itemTitle = devEnable ? ctitle(title) : title ? title : false;
  return show ? (
    <Col span={span}>
      {type == 'tab' ? (
        <ItemTab {...props} />
      ) : type == 'table' ? (
        <PanelItemTable {...props} data={idata} />
      ) : rows || type == 'rows' ? (
        <>
          {ctitle()}
          <Panel rows={rows} data={data} />
        </>
      ) : type == 'form' ? (
        <ItemForm {...props} idata={idata} />
      ) : type == 'user' ? (
        <ProCard
          headStyle={devEnable ? { width: '100%', display: 'block' } : {}}
          title={devEnable ? ctitle() : false}
        >
          <PagePanelHeader flash={getData} />
        </ProCard>
      ) : type == 'StatisticCard' ? (
        <PanelItemCard title={itemTitle} data={idata?.data} config={config} />
      ) : null}
    </Col>
  ) : null;
};

const ItemForm = (props) => {
  const { config, idata, title, uid, getData, simple } = props;
  //console.log('idata is ', idata);
  const {
    tableDesigner: { devEnable },
  } = useContext(SaContext);
  const ctitle = (_title = '') => {
    return (
      <DevPanelColumnTitle
        otitle={_title ? _title : title}
        title={_title ? _title : title ? title : '元素 - ' + uid}
        uid={uid}
        col={props}
        devData={{ itemType: 'col' }}
      />
    );
  };
  //处理一遍后端的动态参数，如果有前端设置动态参数的话 需要一个编译js的函数 类似 tplComplie
  const _columns = config?.columns?.map((v) => {
    //获取是否有设置
    const ps = idata?.data?.find((ida) => ida.name == v.dataIndex);
    if (ps) {
      v = { ...v, ...ps.props };
    }
    return v;
  });
  const _columnsx = getFormFieldColumns({
    initRequest: true,
    columns: _columns,
    devEnable: false,
  });
  const form = (
    <BetaSchemaForm
      layoutType={simple ? 'LightFilter' : 'QueryFilter'}
      columns={_columnsx}
      rowProps={{
        gutter: [16, 16],
      }}
      colProps={{
        span: 12,
      }}
      grid={false}
      initialValues={idata?.initialValues}
      onFinish={(data: { [key: string]: any }) => {
        //setFormData(data);
        getData?.(data);
      }}
    />
  );
  return simple ? (
    form
  ) : (
    <ProCard
      //style={{ padding: 0 }}
      bodyStyle={{ padding: 0 }}
      title={devEnable ? ctitle() : false}
      // style={{
      //   marginBottom: -16,
      //   borderBottomRightRadius: 0,
      //   borderBottomLeftRadius: 0,
      // }}
      // bodyStyle={{ paddingBottom: 0 }}
    >
      {form}
    </ProCard>
  );
};

const ItemTab = (props) => {
  const { uid, rows, data, getData, config, sourceDataName, height } = props;
  const {
    tableDesigner: { devEnable },
  } = useContext(SaContext);
  const idata = data?.find((v) => v.value == sourceDataName);
  const rightForm = config.form ? (
    <ItemForm simple={true} idata={idata} config={config.form} getData={getData} />
  ) : null;
  return (
    <ProCard
      style={{
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
      }}
      title={
        devEnable ? (
          <DevPanelColumnTitle
            uid={uid}
            col={props}
            devData={{ itemType: 'col' }}
            title={'Tab - ' + uid}
            otitle={null}
          />
        ) : (
          false
        )
      }
    >
      <Tabs
        style={{ background: 'none' }}
        tabBarExtraContent={
          rightForm
            ? {
                right: rightForm,
              }
            : null
        }
        destroyInactiveTabPane={true}
        items={rows?.map((row, i) => {
          return {
            key: i,
            label: (
              <DevPanelColumnTitle
                title={row?.title ? row?.title : 'tabItem'}
                otitle={row?.title}
                uid={row?.uid}
                row={row}
                devData={{ itemType: 'row' }}
              />
            ),
            children: <ItemRow index={i} key={i} row={row} data={data} noTitle={true} />,
          };
        })}
      />
    </ProCard>
  );
};

const ItemRow = (props) => {
  const { row, data, noTitle = false, index, getData } = props;
  return (
    <Row gutter={[16, 16]} style={{ marginTop: -16 }}>
      {noTitle ? null : (
        <Col span={24} key={'row'}>
          <DevPanelColumnTitle
            span={24}
            otitle={null}
            title={row?.title ? row?.title : '分组 - ' + row?.uid}
            uid={row?.uid}
            devData={{ itemType: 'row' }}
            row={row}
          />
        </Col>
      )}

      {row?.cols?.map((col, key) => {
        return <ItemCol {...col} key={key} data={data} getData={getData} />;
      })}
    </Row>
  );
};

const SaPanel = (props) => {
  const { url = '', pageMenu, path, ...restProps } = props;
  const [data, setData] = useState();
  //const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{ [key: string]: any }>();
  const { messageApi } = useContext(SaDevContext);
  const getData = async (params = {}) => {
    //setLoading(true);
    //message.loading('加载中...');
    messageApi?.loading({ content: '加载中...', key: messageLoadingKey, duration: 0 });
    const { data: rdata } = await request.get(url, {
      params: { ...formData, ...params },
    });
    messageApi?.destroy();
    // //setLoading(false);
    setData(rdata);
  };

  const [rows, setColumns] = useState();
  const { initialState } = useModel('@@initialState');
  const [devEnable, setDevEnable] = useState<boolean>(
    !initialState?.settings?.devDisable && initialState?.settings?.dev ? true : false,
  );

  useEffect(() => {
    //console.log('pageMenu', pageMenu);

    setColumns(pageMenu?.data?.panel);

    getData();
  }, []);

  const tableDesigner = useTableDesigner({
    pageMenu,
    setColumns,
    getColumnsRender: (rows) => rows,
    type: 'panel',
    devEnable,
    sourceData: data,
  });
  useEffect(() => {
    setDevEnable(!initialState?.settings?.devDisable && initialState?.settings?.dev ? true : false);
  }, [initialState?.settings?.devDisable]);

  return (
    <PageContainer
      title={false}
      className="saContainer"
      fixedHeader={saConfig.fixedHeader}
      header={{
        breadcrumbRender: (_, dom) => {
          return <SaBreadcrumbRender path={path} />;
        },
      }}
    >
      <SaContext.Provider
        value={{
          tableDesigner,
        }}
      >
        <DndContext key="content">
          {data && <Panel {...restProps} rows={rows} data={data} getData={getData} />}
        </DndContext>
        {!data && <Skeleton paragraph={{ rows: 10 }} active />}
        {devEnable ? (
          <Space style={{ marginTop: 10 }}>
            <Button
              type="dashed"
              key="addrow"
              onClick={() => {
                tableDesigner.edit({ base: { id: pageMenu?.id, actionType: 'insertRow' } });
              }}
            >
              + Row
            </Button>
            <ToolBarMenu
              key="devsetting"
              trigger={
                <Button type="dashed" danger>
                  <SettingOutlined />
                </Button>
              }
              pageMenu={pageMenu}
            />
          </Space>
        ) : null}
      </SaContext.Provider>
    </PageContainer>
  );
};

const Panel = (props) => {
  const { rows, data, getData } = props;
  //console.log('data is', data);
  return (
    <Flex vertical gap="middle">
      {rows?.map((row, key) => {
        return <ItemRow index={key} key={key} row={row} data={data} getData={getData} />;
      })}
    </Flex>
  );
};

export default SaPanel;
