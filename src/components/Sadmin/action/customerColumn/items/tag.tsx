import { isArr, isObj, isPlainObj, isStr } from '@/components/Sadmin/checkers';
import { getFromObject } from '@/components/Sadmin/helpers';
import { iconToElement } from '@/components/Sadmin/valueTypeMap/iconSelect';
import type { GetProp } from 'antd';
import { Badge, Space, Tag, Typography } from 'antd';
import type { FC, Key } from 'react';
const ItemTag: FC<{
  color?: string;
  title?: string;
  bordered?: boolean;
  icon?: string;
  ellipsis?: boolean;
}> = (props) => {
  const { color, title, bordered = true, icon, ellipsis = true } = props;
  return title ? (
    <Tag
      color={color}
      variant={bordered ? 'outlined' : 'filled'}
      icon={icon ? iconToElement(icon) : false}
    >
      {ellipsis ? (
        <Typography.Text style={{ maxWidth: 80, color: 'inherit' }} ellipsis={{ tooltip: title }}>
          {title}
        </Typography.Text>
      ) : (
        title
      )}
    </Tag>
  ) : null;
};

const ItemTags: FC<{
  tags?: { color?: string; title?: string; status?: GetProp<typeof Badge, 'status'> }[];
  color?: string;
  dataindex?: string | string[];
  bordered?: boolean;
  icon?: string;
  ellipsis?: boolean;
  type?: string;
  data?: Record<string, any>;
}> = (props) => {
  const {
    tags = [],
    dataindex,
    color,
    bordered,
    icon,
    ellipsis = true,
    type = 'tag',
    data,
  } = props;

  // console.log('dataindex', dataindex, searchData, tags);

  //读取配置参数 dataindex 或复数 s是否有

  const getOptions = (index?: string | string[]) => {
    const option = getFromObject(data, index);
    if (option && isPlainObj(option)) {
      return [option];
    }
    //检测dataindex中是否存在_id字符串，读取去掉_id后数据
    if (index?.toString().includes('_id')) {
      const rt = getFromObject(data, index?.toString().replace('_id', ''));
      if (rt) {
        return [rt];
      }
    }
    return isStr(index) ? getFromObject(data, index + 's') : [];
  };

  const options = getOptions(dataindex);
  const tagsDom = tags.map((tag, i) => {
    let xtag = tag;
    if (!isObj(tag)) {
      const opt = isArr(options) ? options?.find((v) => v.id == tag) : false;
      xtag = opt ? opt : { color, title: tag == 0 ? '0' : tag, icon, status: 'success' };
    }
    return xtag.title !== '' ? (
      type == 'tag' ? (
        <ItemTag key={i as Key} {...xtag} bordered={bordered} ellipsis={ellipsis} />
      ) : xtag.status ? (
        <Badge key={i as Key} status={xtag.status} text={xtag.title} />
      ) : (
        <Badge key={i as Key} color={xtag.color} text={xtag.title} />
      )
    ) : (
      '-'
    );
  });
  return tags.length > 1 ? <Space>{tagsDom}</Space> : tagsDom;
};

export default ItemTags;
