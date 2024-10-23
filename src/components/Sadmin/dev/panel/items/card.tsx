import { isObj } from '@/components/Sadmin/checkers';
import { Statistic, StatisticCard } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Divider, Progress, Space } from 'antd';
import PanelItemChart from './chart';

const PanelItemCard = (props) => {
  const { title, data, config = {}, height } = props;
  const { open } = config;

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
    const trends = data.map((v, i) => <Statistic key={i} {...v} />);
    return layout == 'vertical' ? trends : <Space>{trends}</Space>;
  };

  const getFooter = (config, data) => {
    const configFooter = config.footer || { type: 'text' };
    if (!config.open?.footer) {
      //未开启底部设置
      return null;
    }
    let footerContent;
    if (configFooter.type == 'trend') {
      //趋势显示
      if (!data.trend) {
        //无趋势数据
        return null;
      }
      footerContent = getTrends(data.trend, configFooter?.layout);
    } else {
      //文本显示
      const text = data.footer ? data.footer : configFooter.text;
      if (!text) {
        return null;
      }
      footerContent = text;
    }
    return (
      <>
        <Divider style={{ marginTop: -16, marginBottom: 10 }} />
        {footerContent}
      </>
    );
  };

  const statistic = open?.statistic
    ? {
        ...config?.statistic,
        value: isObj(data) ? data?.value : data,
        description: getDescription(config, data),
      }
    : false;
  //console.log('PanelItemCard config ', statistic);
  const getChart = (config, data) => {
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
      return <div style={style}>{getTrends(data.trend, config.chart?.trend?.layout)}</div>;
    } else if (type == 'progress') {
      return <div style={style}>{data.progress?.map((v, i) => <Progress key={i} {...v} />)}</div>;
    } else {
      return <PanelItemChart {...data?.chart} config={chart} type={type} />;
    }
    return null;
  };
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
