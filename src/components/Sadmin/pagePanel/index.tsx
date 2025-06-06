import request from '@/components/Sadmin/lib/request';
import { BetaSchemaForm, PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Link, useModel } from '@umijs/max';
//import { PageContainer } from '@ant-design/pro-layout';
import { saConfig } from '@/components/Sadmin/config';
import { SaBreadcrumbRender } from '@/components/Sadmin/helpers';
import { SyncOutlined } from '@ant-design/icons';
import { Bar, Column, Line, Pie } from '@ant-design/plots';
import { App, Avatar, Button, Col, Flex, Row, Skeleton, Table, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { getFormFieldColumns } from '../posts/formDom';
import { getTableColumns } from '../posts/tableColumns';
import styles from './style.less';
import AreaMap from '../dev/panel/items/areaMap';
import numeral from 'numeral';
import { PageContainer404 } from '../404';
import { MapShow } from '../map';
import { sum } from 'es-toolkit';
export const PagePanelHeader: FC = (props) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState;
  const loading = currentUser && Object.keys(currentUser).length;
  if (!loading) {
    return <Skeleton avatar paragraph={{ rows: 1 }} active />;
  }
  return (
    <div className={styles.pageHeaderContent}>
      <div className={styles.avatar}>
        <Avatar
          size="large"
          src={currentUser.avatar ? currentUser.avatar : initialState?.settings?.adminSetting?.logo}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.contentTitle}>
          <Row>
            <Col span={12}>
              <Row>
                <Col>
                  你好，
                  {currentUser.realname ? currentUser.realname : currentUser.name}
                </Col>
              </Row>
              <Row>
                <Col>
                  {currentUser.rolename}{' '}
                  <Button
                    shape="circle"
                    type="text"
                    onClick={() => {
                      props.flash?.();
                    }}
                    icon={<SyncOutlined />}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <ClockPanel />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

const ClockPanel = () => {
  const [nowDate, setNowDate] = useState(dayjs().format('YYYY年MM月DD日 HH:mm:ss dddd'));
  const clock = () => {
    setNowDate(dayjs().format('YYYY年MM月DD日 HH:mm:ss dddd'));
    setTimeout(() => clock(), 1000);
  };
  setTimeout(() => clock(), 1000);
  return <>{nowDate}</>;
};

const PagePanel: React.FC<{ url?: string }> = (props) => {
  const { url = '' } = props;
  const [data, setData] = useState();
  const { message } = App.useApp();
  //const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{ [key: string]: any }>();
  const { initialState } = useModel('@@initialState');
  const getData = async (params = {}) => {
    //setLoading(true);
    message.loading('加载中...');
    const { data: rdata } = await request.get(url, {
      params: { ...formData, ...params },
      then: () => {},
    });
    message.destroy();
    //setLoading(false);
    setData(rdata);
  };

  useEffect(() => {
    getData();
  }, []);

  const getChart = (chart) => {
    const { type } = chart;
    let x = chart.config?.xField;
    let y = chart.config?.yField;
    if (type == 'pie') {
      x = chart.config.colorField;
      y = chart.config.angleField;
      const sum_val = sum(chart.data.map((v) => v[y]));

      return (
        <Pie
          height={280}
          appendPadding={10}
          data={chart.data}
          radius={0.9}
          // label={{
          //   type: 'inner',
          //   offset: '-30%',
          //   content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
          //   style: {
          //     fontSize: 14,
          //     textAlign: 'center',
          //   },
          // }}
          label={{
            position: 'spider',
            text: (item: any) => {
              //console.log('item is ', item);
              return `${item[x]}: ${numeral(item[y]).format('0,0')}`;
            },
          }}
          annotations={[
            {
              type: 'text',
              style: {
                text: `总计\n${sum_val}`,
                x: '50%',
                y: '50%',
                textAlign: 'center',
                fontSize: 18,
                //fontStyle: 'bold',
              },
            },
          ]}
          interactions={[
            {
              type: 'element-active',
            },
          ]}
          legend={chart.config?.legend ? chart.config?.legend : false}
          {...chart.config}
        />
      );
    } else if (type == 'bar') {
      return (
        <Bar
          xField={x}
          yField={y}
          scale={{ x: { paddingInner: 0.4 } }}
          data={chart.data}
          tooltip={{ name: chart.config?.name, field: y }}
          {...chart.config}
        />
      );
    } else if (type == 'column') {
      return (
        <Column
          xField={x}
          yField={y}
          scale={{ x: { paddingInner: 0.4 } }}
          data={chart.data}
          {...chart.config}
        />
      );
    } else if (type == 'areaMap') {
      const config = {
        map: {
          type: 'mapbox',
          style: 'blank',
          center: [120.19382669582967, 30.258134],
          zoom: 13,
          pitch: 0,
        },
        source: {
          data: chart.data,
          parser: {
            type: 'geojson',
          },
        },
        autoFit: true,
        color: {
          field: chart.field,
          value: ['#1A4397', '#3165D1', '#6296FE', '#98B7F7', '#DDE6F7', '#F2F5FC'].reverse(),
          scale: {
            type: 'quantile',
          },
        },
        style: {
          opacity: 1,
          stroke: '#eee',
          lineWidth: 0.8,
          lineOpacity: 1,
        },
        state: {
          active: true,
          select: {
            stroke: 'blue',
            lineWidth: 1.5,
            lineOpacity: 0.8,
          },
        },
        label: {
          visible: true,
          field: 'name',
          style: {
            fill: 'black',
            opacity: 0.5,
            fontSize: 12,
            spacing: 1,
            padding: [15, 15],
          },
        },
        // tooltip: {
        //   items: [
        //     {
        //       field: 'name',
        //       alias: '省份',
        //     },
        //     {
        //       field: 'unit_price',
        //       alias: '价格',
        //     },
        //   ],
        // },

        zoom: {
          position: 'bottomright',
        },
        legend: {
          position: 'bottomleft',
        },
        ...chart.config,
      };
      return (
        <div style={{ width: '100%', height: 500 }}>
          <AreaMap data={chart.data} config={chart} />
        </div>
      );
    } else {
      return (
        <Line
          smooth={true}
          shapeField="smooth"
          height={280}
          data={chart.data}
          xField="x"
          yField="y"
          title={{
            visible: true,
            text: chart.title,
            style: {
              fontSize: 14,
            },
          }}
          meta={{
            y: {
              alias: chart.y,
            },
          }}
          label={{
            content: (originData) => {
              return originData.y;
            },
            position: 'top',
            // 'top', 'bottom', 'middle',
            // 配置样式
            style: {
              fill: '#000000',
              opacity: 0.6,
            },
          }}
          {...chart.config}
        />
      );
    }
  };

  const paiban = (data, render) => {
    return (
      <Flex vertical gap="middle">
        {data?.row?.map((row, rowkey) => {
          return (
            <Row key={rowkey} gutter={[16, 16]}>
              {row.form ? (
                <Col span={24} key={rowkey + 'form'}>
                  <ProCard
                    //style={{ padding: 0 }}
                    bodyStyle={{ padding: 0 }}
                    // style={{
                    //   marginBottom: -16,
                    //   borderBottomRightRadius: 0,
                    //   borderBottomLeftRadius: 0,
                    // }}
                    // bodyStyle={{ paddingBottom: 0 }}
                  >
                    <BetaSchemaForm
                      layoutType="QueryFilter"
                      columns={getFormFieldColumns({
                        initRequest: true,
                        columns: row.form.columns,
                        devEnable: false,
                      })}
                      initialValues={formData ? formData : row.form.value}
                      onFinish={(data: { [key: string]: any }) => {
                        //setFormData(data);
                        getData(data);
                        console.log('onFinish', data);
                      }}
                    />
                  </ProCard>
                </Col>
              ) : null}
              {row?.col?.map((chart, k) => {
                if (chart.row) {
                  return (
                    <Col span={chart.span ? chart.span : 24 / row.col?.length} key={k}>
                      {paiban(chart, render)}
                    </Col>
                  );
                } else {
                  if (chart.tab) {
                    //开启tab
                    return (
                      <Col span={chart.span ? chart.span : 24 / row.col?.length} key={k}>
                        <ProCard
                          key={k}
                          style={{
                            borderTopRightRadius: 0,
                            borderTopLeftRadius: 0,
                          }}
                        >
                          <Tabs
                            style={{ background: 'none' }}
                            tabBarStyle={{ paddingLeft: 0, marginBottom: 0 }}
                            items={chart.tab.map((tab, i) => {
                              return {
                                key: i,
                                label: tab.title,
                                children: tab.row
                                  ? paiban(tab, render)
                                  : render(tab, i, { notitle: true }),
                              };
                            })}
                          />
                        </ProCard>
                      </Col>
                    );
                  } else {
                    return (
                      <Col key={k} span={chart.span ? chart.span : 24 / row.col?.length}>
                        {render(chart, k)}
                      </Col>
                    );
                  }
                }
              })}
            </Row>
          );
        })}
      </Flex>
    );
  };

  return (
    <PageContainer404 title={false} path={props?.path}>
      <Flex vertical gap="middle">
        <ProCard key="headcard">
          <PagePanelHeader flash={getData} />
        </ProCard>

        {paiban(data, (chart, k, props) => {
          if (chart.type == 'card') {
            return (
              <StatisticCard
                style={{ height: '100%' }}
                key={k + 'card'}
                statistic={{
                  title: chart.title,
                  value: chart.value,
                  prefix: chart.prefix,
                  suffix: chart.suffix,
                  description: chart.href ? (
                    <Link to={chart.href} style={{ fontSize: 12 }}>
                      查看更多
                    </Link>
                  ) : (
                    ''
                  ),
                }}
              />
            );
          } else if (chart.type == 'table') {
            return (
              <ProCard key={k + 'table'} style={{ height: '100%' }}>
                <Table
                  columns={getTableColumns({
                    initRequest: true,
                    columns: chart.columns,
                    initialState,
                    devEnable: false,
                  })}
                  dataSource={chart.data}
                  title={() => chart.title}
                  rowKey="id"
                  {...chart.props}
                />
              </ProCard>
            );
          } else if (chart.type == 'mapDots') {
            return (
              <ProCard title={chart.title} key={k + 'mapDots'} style={{ height: '100%' }}>
                <MapShow {...chart.props} dots={chart.data} />
              </ProCard>
            );
          } else {
            return (
              <StatisticCard
                style={{ height: '100%' }}
                key={k + 'chart'}
                title={props?.notitle ? <div style={{ height: 20 }}></div> : chart.title}
                chart={getChart(chart)}
              />
            );
          }
        })}
      </Flex>
    </PageContainer404>
  );
};

export default PagePanel;
