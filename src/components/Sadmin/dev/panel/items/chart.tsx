import { isArr } from '@/components/Sadmin/checkers';
import { Area, Bar, Column, Line, Pie } from '@ant-design/plots';

import numeral from 'numeral';
import AreaMap from './areaMap';
import { MapShow } from '@/components/Sadmin/map';
import { cloneDeep, sum } from 'es-toolkit';
const PanelItemChart = (props: any) => {
  const { type, data, config: oconfig, propsx, ...retProps } = props;
  //const { type } = chart;
  const config = cloneDeep(oconfig);
  const getField = (name: string) => {
    return retProps?.fields?.find((v: any) => {
      return v?.value == name;
    });
  };
  delete config.type;
  //1.支持config.label.text的模板写法 json不支持函数格式
  const getCode = (str: string) => {
    const exp = /{{\s*([^{}]*)\s*}}/g;
    const matches = [];
    let match;
    while ((match = exp.exec(str)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  };
  const tpls: { labelText?: any } = {};
  if (config.label?.text) {
    const match = getCode(config.label.text);
    try {
      tpls.labelText = (d) => {
        return new Function('$root', `with($root) { return (${match}); }`)({ d });
      };
    } catch (error) {
      console.log('exp error', match);
    }
  }
  if (type == 'pie') {
    const x = config.colorField;
    const y = config.angleField;
    const sum_val = sum(data?.map((v) => v[y]));
    if (sum_val > 0) {
      data?.map((v) => {
        v.per = ((v[y] / sum_val) * 100).toFixed(2) + '%';
      });
    }
    const { label, ...leftConfig } = config;

    return (
      <Pie
        appendPadding={10}
        data={data}
        // label={{
        //   type: 'inner',
        //   offset: '-30%',
        //   content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
        //   style: {
        //     fontSize: 14,
        //     textAlign: 'center',
        //   },
        // }}
        label={
          label === false
            ? false
            : {
                ...label,
                position: 'outside',
                text: tpls.labelText
                  ? tpls.labelText
                  : (item: any) => {
                      return `${item[x]}: ${numeral(item[y]).format('0,0')}`;
                    },
                transform: [{ type: 'overlapDodgeY' }],
              }
        }
        tooltip={(item: any, index, data, column) => {
          return { value: `${item[x]}: ${numeral(item[y]).format('0,0')}` };
        }}
        annotations={[
          {
            type: 'text',
            style: {
              text: `总计\n${numeral(sum_val).format('0,0')}`,
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
        radius={0.9}
        innerRadius={0.6}
        legend={{
          color: {
            maxCols: 1,
            maxRows: 1,
            position: 'top',
          },
        }}
        {...leftConfig}
      />
    );
  } else if (type == 'bar') {
    return <Bar data={data} scale={{ x: { paddingInner: 0.4 } }} {...config} />;
  } else if (type == 'column') {
    const x = config.xField;
    const y = config.yField;
    const field = getField(y);
    const { label, ...leftConfig } = config;
    return (
      <Column
        data={data}
        scale={{ x: { paddingInner: 0.4 } }}
        label={
          label === false
            ? false
            : {
                textBaseline: 'bottom',
                ...label,
                text: tpls.labelText ? tpls.labelText : (d: any) => d?.[y],
              }
        }
        style={{
          // 圆角样式
          radiusTopLeft: 10,
          radiusTopRight: 10,
        }}
        tooltip={{ name: field?.label, field: y }}
        {...leftConfig}
      />
    );
  } else if (type == 'area') {
    return <Area data={data} {...config} />;
  } else if (type == 'mapDots') {
    return <MapShow {...config} {...propsx} dots={isArr(data) ? data : []} />;
  } else if (type == 'areaMap') {
    const configx = {
      map: {
        style: 'blank',
        center: [120.19382669582967, 30.258134],
        zoom: 13,
        pitch: 0,
      },
      source: {
        data: data,
        parser: {
          type: 'geojson',
        },
      },
      autoFit: true,
      color: {
        field: config.field,
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
      ...config,
    };
    return <AreaMap config={configx} data={data} />;
  } else {
    //console.log('line', data, config);
    return (
      <Line
        data={data}
        // title={{
        //   visible: true,
        //   text: chart.title,
        //   style: {
        //     fontSize: 14,
        //   },
        // }}
        // meta={{
        //   y: {
        //     alias: chart.y,
        //   },
        // }}
        // label={{
        //   content: (originData) => {
        //     return originData.gdp + '元';
        //   },
        //   position: 'top',
        //   // 'top', 'bottom', 'middle',
        //   // 配置样式
        //   style: {
        //     fill: '#000000',
        //     opacity: 0.6,
        //   },
        // }}
        {...config}
      />
    );
  }
};

export default PanelItemChart;
