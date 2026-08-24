import { isObj } from '@/components/Sadmin/checkers';
import { Statistic, StatisticCard } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Progress, Space } from 'antd';
import PanelItemChart from './chart';

interface PanelItemCardProps {
  title?: string;
  data?: Record<string, any>;
  config?: Record<string, any>;
  height?: number;
  label?: string;
}

const PanelItemCard = (props: PanelItemCardProps) => {
  const getDescription = (config: Record<string, any>, data: Record<string, any>) => {
    const href = config?.href ? config.href : data?.href ? data.href : null;
    if (href) {
      return (
        <Link to={href} style={{ fontSize: 12 }}>
          {config.statistic?.description ? config.statistic?.description : '查看'}
        </Link>
      );
    } else {
      return config.statistic?.description;
    }
  };

  const getTrends = (data = [], layout = 'horizontal') => {
    const trends = data.map((v: Record<string, any>, i) => <Statistic key={i} {...v} />);
    return layout == 'vertical' ? trends : <Space>{trends}</Space>;
  };
  const getFooter = (config: Record<string, any>, data: Record<string, any>) => {
    const configFooter = config.footer || { type: 'text' };
    if (!config.open?.footer) {
      //未开启底部设置
      return null;
    }
    let footerContent;
    if (configFooter.type == 'trend') {
      //趋势显示
      if (!data?.trend) {
        //无趋势数据
        return null;
      }
      footerContent = getTrends(data?.trend, configFooter?.layout);
    } else {
      //文本显示
      const text = data?.footer ? data.footer : configFooter.text;
      if (!text) {
        return null;
      }
      footerContent = <div dangerouslySetInnerHTML={{ __html: text }}></div>;
    }
    return footerContent;
  };

  //console.log('PanelItemCard config ', config?.statistic, label);
  const getChart = (config: Record<string, any>, data: Record<string, any>) => {
    //console.log('getChart ', config, data);
    const { chart = {}, open } = config;
    const { type = '' } = chart;
    if (!open?.chart) {
      //未开启底部设置
      return null;
    }
    if (!type) {
      return null;
    }
    const style = chart?.height ? { height: chart?.height, lineHeight: chart?.height + 'px' } : {};
    if (type == 'trend') {
      return <div style={style}>{getTrends(data?.trend, config.chart?.trend?.layout)}</div>;
    } else if (type == 'progress') {
      return (
        <div style={style}>
          {data?.progress?.map((v: Record<string, any>, i: string) => (
            <Progress key={i} {...v} />
          ))}
        </div>
      );
    } else {
      return <PanelItemChart {...data?.chart} config={chart} type={type} />;
    }
  };
  const { title, data = {}, config = {}, height, label } = props;
  const { open } = config;

  const statistic = open?.statistic
    ? {
        ...config?.statistic,
        value: isObj(data) ? data?.value || '' : data,
        description: getDescription(config, data),
        title: config?.statistic?.title ? config?.statistic?.title : label,
      }
    : false;
  return (
    <StatisticCard
      footer={getFooter(config, data)}
      style={{ height: height ? height : '100%' }}
      title={title}
      statistic={statistic}
      chart={getChart(config, data)}
    />
  );
};

export default PanelItemCard;
