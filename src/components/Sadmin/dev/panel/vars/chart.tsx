import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { layoutType } from './base';
import areaColumns from './chart/area';
import areaMapColumns from './chart/areaMap';
import barColumns from './chart/bar';
import columnColumns from './chart/column';
import lineColumns from './chart/line';
import mapDotsColumns from './chart/mapDots';
import pieColumns from './chart/pie';

const chartColumns = (xdata): saFormColumnsType => {
  const data = xdata?.data?.chart ? xdata?.data?.chart : xdata;
  //console.log('chartColumns', xdata, data);
  return [
    {
      title: '图表类型',
      dataIndex: ['defaultConfig', 'chart', 'type'],
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '饼图', value: 'pie' },
          { label: '折线图', value: 'line' },
          { label: '柱形图', value: 'column' },
          { label: '条形图', value: 'bar' },
          { label: '区域图', value: 'area' },
          { label: '区域地图', value: 'areaMap' },
          { label: '趋势', value: 'trend' },
          { label: '进度条', value: 'progress' },
          { label: '标点地图', value: 'mapDots' },
        ],
      },
      colProps: { span: 12 },
    },
    {
      title: '高度',
      dataIndex: ['defaultConfig', 'chart', 'height'],
      valueType: 'digit',
      width: '100%',
      colProps: { span: 12 },
    },
    {
      name: [['defaultConfig', 'chart', 'type']],
      valueType: 'dependency',
      columns: ({ defaultConfig }) => {
        //   const type = { chart };
        //console.log('defaultConfig', defaultConfig);
        if (!defaultConfig) {
          return [];
        }
        const { chart = {} } = defaultConfig;
        if (chart?.type == 'pie') {
          return pieColumns(data);
        } else if (chart?.type == 'line') {
          return lineColumns(data);
        } else if (chart?.type == 'area') {
          return areaColumns(data);
        } else if (chart?.type == 'column') {
          return columnColumns(data);
        } else if (chart?.type == 'bar') {
          return barColumns(data);
        } else if (chart?.type == 'areaMap') {
          return areaMapColumns(data);
        } else if (chart?.type == 'trend') {
          return layoutType(['defaultConfig', 'chart', 'trend', 'layout']);
        } else if (chart?.type == 'mapDots') {
          return mapDotsColumns(data);
        }
        return [];
      },
    },
  ];
};
export default chartColumns;
