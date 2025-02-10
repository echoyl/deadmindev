import request from '@/components/Sadmin/lib/request';
import { Badge, Calendar, CalendarProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import ButtonModal from '../action/buttonModal';
import FormFromBread from '../formFromBread';
import { getBread } from '../helpers';
import { useModel } from '@umijs/max';
import { isArr } from '../checkers';
import { SaContext } from '../posts/table';

const FormCalendar: React.FC<{
  width?: number;
  title?: string;
  url?: string;
  data?: { [key: string]: any };
  defaultContent?: string;
  onlyFuture?: boolean; //是否只有未来日期可选
  path?: string;
  colors?: string[];
  recordFields?: string[]; //传输当前表单数据字段信息
  idName?: string; //关联数据的id名称
}> = (props) => {
  const [open, setOpen] = useState(false);
  const [selectMonth, setSelectMonth] = useState<string>();
  const [selectDate, setSelectDate] = useState<string>();
  const onSelect = (date: Dayjs, { source }) => {
    //弹出配置form
    const value = date.format('YYYY-MM-DD');
    const now = dayjs().format('YYYY-MM-DD');
    if (source === 'date') {
      if (onlyFuture && value < now) {
        return;
      }
      setOpen(true);
      setSelectDate(value);
    }
  };

  const {
    width = 800,
    title = '日历设置 - 单独设置日期后，会覆盖通用设置值',
    defaultContent = '-',
    onlyFuture = true,
    path = '',
    colors = [
      'blue',
      'orange',
      'yellow',
      'pink',
      'cyan',
      'green',
      'purple',
      'geekblue',
      'magenta',
      'volcano',
      'gold',
      'lime',
      'red',
    ],
    recordFields = ['id'],
    idName = 'id',
  } = props;
  const { initialState } = useModel('@@initialState');
  const bread = getBread(path, initialState?.currentUser);
  const url = bread?.data?.url ? bread?.data.url : '';
  //这里可能需要再抽一层 ButtonModalForm 出来
  const [allData, setAllData] = useState<Array<Record<string, any>>>();
  const { formRef } = useContext(SaContext);
  const [record, setRecord] = useState();

  const getRecordByFields = (fields, record) => {
    const ret = {};
    if (!record) {
      return ret;
    } else {
      fields.forEach((v) => {
        ret[v] = record[v];
      });
    }
    return { record: ret, [idName]: record.id };
  };

  useEffect(() => {
    if (formRef.current && Object.keys(formRef.current).length > 0) {
      //在获取form实例后再发起请求
      const record = formRef.current.getFieldsValue?.(true);
      setRecord(record);
      initData(getRecordByFields(recordFields, record));
    }
  }, [formRef]);
  const initData = async (params?: { [key: string]: any }) => {
    if (!url) {
      return;
    }
    const recordParams = getRecordByFields(recordFields, record);
    const ret = await request.get(url, { params: { ...recordParams, ...params } });
    setAllData(ret.data);
  };

  const getListData = (value: Dayjs): Record<string, any> | undefined => {
    const date = value.format('YYYY-MM-DD');
    const content = allData?.find((v) => v.date == date);
    return content ? content : { content: defaultContent };
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    if (isArr(listData?.content)) {
      //数组格式使用ul li展示
      return (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {listData?.content.map((item, k) => (
            <li key={k}>
              <Badge
                color={colors[k] ? colors[k] : colors[0]}
                text={item}
                style={{
                  width: '100%',
                  overflow: 'hidden',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              />
            </li>
          ))}
        </ul>
      );
    } else {
      //如果是非数组，则直接显示html
      return <div dangerouslySetInnerHTML={{ __html: listData?.content }}></div>;
    }
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  const onChange = (value: Dayjs) => {
    const month = value.format('YYYY-MM');
    setSelectMonth(month);
    initData({ month });
  };

  return (
    <>
      <Calendar onSelect={onSelect} cellRender={cellRender} onPanelChange={onChange} />
      <ButtonModal
        open={open}
        width={width}
        title={title}
        afterOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <FormFromBread
          fieldProps={{
            path,
            props: {
              paramExtra: { date: selectDate, ...getRecordByFields(recordFields, record) },
              postExtra: { date: selectDate, ...getRecordByFields(recordFields, record) },
              formProps: {
                submitter: {
                  searchConfig: { resetText: '取消' },
                  resetButtonProps: {
                    onClick: () => {
                      setOpen?.(false);
                    },
                  },
                },
              },
              msgcls: ({ code }) => {
                //setConfirmLoading(false);
                if (!code) {
                  //actionRef.current?.reload();
                  //设置弹出层关闭，本来会触发table重新加载数据后会关闭弹层，但是如果数据重载过慢的话，这个会感觉很卡所以在这里直接设置弹层关闭
                  setOpen(false);
                  initData({ month: selectMonth });
                  return;
                }
              },
            },
          }}
        />
      </ButtonModal>
    </>
  );
};

export const FormCalendarRender = (text, props) => {
  return <FormCalendar {...props.fieldProps} />;
};

export default FormCalendar;
