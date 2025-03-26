import { isObj } from '@/components/Sadmin/checkers';
import { getFromObject } from '@/components/Sadmin/helpers';
import { SaContext } from '@/components/Sadmin/posts/table';
import { iconToElement } from '@/components/Sadmin/valueTypeMap/iconSelect';
import { Badge, Tag, Typography } from 'antd';
import { BadgeProps } from 'antd/lib';
import { FC, useContext } from 'react';
const ItemTag: FC<{
  color?: string;
  title?: string;
  bordered?: boolean;
  icon?: string;
  ellipsis?: boolean;
}> = (props) => {
  const { color, title, bordered = true, icon, ellipsis = true } = props;
  return title ? (
    <Tag color={color} bordered={bordered} icon={icon ? iconToElement(icon) : false}>
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
  tags?: Array<{ color?: string; title?: string; status?: BadgeProps['status'] }>;
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
  const option = getFromObject(data, dataindex);
  const options = option ? option : getFromObject(data, dataindex + 's');
  return (
    <>
      {tags.map((tag, i) => {
        let xtag = tag;
        if (!isObj(tag)) {
          const opt = options?.find((v) => v.id == tag);
          xtag = opt ? opt : { color, title: tag, icon, status: 'success' };
        }
        return xtag.title ? (
          type == 'tag' ? (
            <ItemTag key={i} {...xtag} bordered={bordered} ellipsis={ellipsis} />
          ) : xtag.status ? (
            <Badge key={i} status={xtag.status} text={xtag.title} />
          ) : (
            <Badge key={i} color={xtag.color} text={xtag.title} />
          )
        ) : (
          '-'
        );
      })}
    </>
  );
};

export default ItemTags;
