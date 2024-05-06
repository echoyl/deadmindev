import { isObj } from '@/components/Sadmin/checkers';
import { getFromObject } from '@/components/Sadmin/helpers';
import { SaContext } from '@/components/Sadmin/posts/table';
import { iconToElement } from '@/components/Sadmin/valueTypeMap/iconSelect';
import { Tag, Typography } from 'antd';
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
  tags?: Array<{ color?: string; title?: string }>;
  color?: string;
  dataindex?: string | string[];
  bordered?: boolean;
  icon?: string;
  ellipsis?: boolean;
}> = (props) => {
  const { tags = [], dataindex, color, bordered, icon, ellipsis = true } = props;

  const { searchData } = useContext(SaContext);

  // console.log('dataindex', dataindex, searchData, tags);

  //读取配置参数 dataindex 或复数 s是否有
  const option = getFromObject(searchData, dataindex);
  const options = option ? option : getFromObject(searchData, dataindex + 's');
  return (
    <>
      {tags.map((tag, i) => {
        let xtag = tag;
        if (!isObj(tag)) {
          const opt = options?.find((v) => v.id == tag);
          xtag = opt ? opt : { color, title: tag, icon };
        }
        return xtag.title ? (
          <ItemTag key={i} {...xtag} bordered={bordered} ellipsis={ellipsis} />
        ) : (
          '-'
        );
      })}
    </>
  );
};

export default ItemTags;
