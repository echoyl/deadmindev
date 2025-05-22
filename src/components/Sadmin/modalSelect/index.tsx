import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { CheckCard } from '@ant-design/pro-components';
import { App, Flex, Modal, Space, Tag, Typography, theme } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { inArray, isArr, isUndefined } from '../checkers';
import { getBread, getFromObject, getMenuDataById } from '../helpers';
import SaTable, { SaContext } from '../posts/table';
import { useModel } from '@umijs/max';
import DndKitContext, { DragItem } from '../dev/dnd-context/dragSort';

const ModalSelect = (props) => {
  const defaultFieldNames = {
    avatar: ['titlepic', 0, 'url'],
    description: 'desc',
    title: 'title',
  };
  const {
    width = 1200,
    multiple = false,
    dataName = 'data', //只在多选的情况下才会设置 用户存放所选数据 字段名
    onChange,
    fieldNames = defaultFieldNames,
    columns = [],
    query: iquery,
    url,
    title = '请选择',
    name,
    relationname,
    page, //新增 直接读取 已有页面的配置
    max = 9,
    value,
    size = 'default',
    extColumns = [], //数据额外获取的列
    type = 'checkbox',
  } = props;
  const { formRef } = useContext(SaContext);
  let breadTableColumns = [];
  let breadUrl = '';
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  if (page) {
    const bread = page.path
      ? getBread(page.path, initialState?.currentUser)
      : getMenuDataById(initialState?.currentUser?.menuData, page.id);
    if (bread) {
      breadTableColumns = bread?.data?.tableColumns?.filter((v) => {
        if (page?.columns) {
          return inArray(v.dataIndex, page?.columns) > -1;
        } else {
          return (
            inArray(v.dataIndex, ['state', 'created_at', 'option', 'displayorder']) < 0 &&
            inArray(v, ['option', 'displayorder']) < 0 &&
            inArray(v.valueType, ['option', 'displayorder']) < 0
          );
        }
      });
      breadUrl = bread?.data.url;
    }
    //message.error({ content: '无' + page.path + '页面权限', key: 'modal_select_error' });
  }

  const [query, setQuery] = useState({});
  const [getData, setGetData] = useState(false); //是否已经通过form获取了数据信息

  const [open, setOpen] = useState(false);

  /**
   * 处理数据 剪掉不必要的字段
   * @param item
   * @returns
   */
  const parseItem = (item: Record<string, any>) => {
    const fiels = { ...defaultFieldNames, ...fieldNames };
    const { title, avatar, description } = fiels;
    const ret = {
      [title]: item[title],
      [description]: item[description],
      id: item.id,
    };
    if (isArr(avatar)) {
      ret[avatar[0]] = item[avatar[0]];
    } else {
      ret[avatar] = item[avatar];
    }
    extColumns?.map((v) => {
      ret[v] = item[v];
    });
    return ret;
  };

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    //点击确认选择关闭弹层赋值
    if (selectItems.length < 1) {
      message.error('请选择选项');
      return;
    }
    //单选和多选的话都 选择对象
    if (multiple) {
      //多选的话传输数据类型为对象非id
      onChange?.(selectItems);
    } else {
      onChange?.(selectItems[0]);
    }

    setSelectedItems([...selectItems]);
    setOpen(false);
  };
  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    //取消选择重设弹层中已选的值
    setSelectItems([...selectedItems]);
    setOpen(false);
  };
  //列表中选中的项
  const [selectItems, setSelectItems] = useState([]);
  //点击确认后选中的项
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (formRef?.current && !getData) {
      const selected = relationname ? formRef?.current?.getFieldValue?.(relationname) : value;

      //console.log('modalselect formRef name value:', name, selected, formRef);
      const parseValue = selected
        ? multiple
          ? isArr(selected)
            ? selected
            : [selected]
          : [selected]
        : [];
      //console.log('selected', selected, props);
      const query: { [key: string]: any } = {};
      const formValues = formRef.current?.getFieldsValue?.(true);
      for (let i in iquery) {
        if (!isUndefined(formValues[iquery[i]])) {
          query[i] = formValues[iquery[i]];
        } else {
          query[i] = iquery[i];
        }
      }
      const svalues = parseValue.map((v) => {
        return multiple
          ? { id: v.id ? v.id : 0, [dataName]: parseItem(v[dataName]) }
          : parseItem(v);
      });
      setSelectItems([...svalues]);
      //console.log('useEffect', svalues);
      setSelectedItems([...svalues]);
      setQuery(query);
      setGetData(true);
    }
  }, [formRef?.current]);

  //选择选项的事件 处理
  const checkEvent = (record) => {
    if (multiple) {
      //多选 将数据放入 fieldname 是data中
      const has_index = selectItems.findIndex((v) => v[dataName]?.id == record.id);
      if (has_index >= 0) {
        //有删除
        selectItems.splice(has_index, 1);
        setSelectItems([...selectItems]);
      } else {
        //没有添加
        //添加时检测最大数量
        if (max && selectItems.length >= max) {
          message.info('最大可选取数量为' + max);
        } else {
          selectItems.push({ id: 0, [dataName]: record });
          setSelectItems([...selectItems]);
        }
      }
    } else {
      //单选
      setSelectItems([record]);
    }
    return;
  };
  const { token } = theme.useToken();
  const radioSelect = {
    title: '操作',
    width: 80,
    fixed: 'right',
    search: false,
    render: (text, record, _, action) => {
      //console.log('radio render', record, selectItems);
      const checkStyle = { color: token.colorPrimary, fontSize: 18 };
      const selected_index: number = multiple
        ? selectItems.findIndex((v) => v[dataName]?.id == record.id)
        : selectItems.findIndex((v) => v.id == record.id);
      if (selected_index >= 0) {
        if (multiple) {
          return (
            <CheckCircleOutlined onClick={() => checkEvent(parseItem(record))} style={checkStyle} />
          );
        } else {
          return <CheckCircleOutlined style={checkStyle} />;
        }
      } else {
        return <a onClick={() => checkEvent(parseItem(record))}>选择</a>;
      }
    },
  };
  const closeItem = (index) => {
    if (multiple) {
      //多选的话传输数据类型为对象非id
      const deleteItem = selectedItems[index];
      const innerIndex = selectItems.findIndex((v) => deleteItem[dataName]?.id == v[dataName]?.id);
      //return;
      selectedItems.splice(index, 1);
      setSelectedItems([...selectedItems]);
      if (innerIndex > -1) {
        //如果弹层列表中有该删除的选项 才将他删除
        selectItems.splice(innerIndex, 1);
        setSelectItems([...selectItems]);
      }
      onChange?.([...selectedItems]);
    } else {
      //单选直接清除
      setSelectedItems([]);
      setSelectItems([]);
      onChange?.([]);
    }
  };
  const tagPlusStyle: React.CSSProperties = {
    background: token.colorBgContainer,
    borderStyle: 'dashed',
    cursor: 'pointer',
  };
  const selectButton =
    type == 'checkbox' ? (
      <div
        className="sa-select-button"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="sa-select-button-select">
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 4 }}>选择</div>
          </div>
        </div>
      </div>
    ) : (
      <Tag
        style={tagPlusStyle}
        onClick={() => {
          setOpen(true);
        }}
      >
        <PlusOutlined /> 选择
      </Tag>
    );
  return (
    <>
      <ModalSelectList
        multiple={multiple}
        dataName={dataName}
        button={selectButton}
        items={selectedItems}
        close={closeItem}
        fieldNames={{ ...defaultFieldNames, ...fieldNames }}
        max={max}
        size={size}
        onChange={(newList: any) => {
          setSelectedItems([...newList]);
          onChange?.([...newList]);
        }}
        type={type}
      />
      <Modal
        width={width}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        title={title}
        okButtonProps={{ disabled: selectItems.length > 0 ? false : true }}
      >
        <SaTable
          url={url ? url : breadUrl}
          paramExtra={query}
          tableColumns={[...breadTableColumns, ...columns, radioSelect]}
          addable={false}
          deleteable={false}
          pageType="drawer"
          openType="drawer"
          checkEnable={false}
          tableProps={{
            //pagination: { pageSize: 20 },
            scroll: { y: 400 },
            size: 'small',
            className: 'sa-modal-table',
            cardBordered: true,
          }}
          devEnable={false}
        />
      </Modal>
    </>
  );
};
const ModalSelectList = (props) => {
  const {
    items,
    close,
    button,
    multiple = false,
    dataName = 'data',
    fieldNames = { avatar: 'avatar', description: 'description', title: 'title' },
    max,
    size = 'default',
    onChange,
    type = 'checkbox',
  } = props;
  const { Paragraph } = Typography;
  const { token } = theme.useToken();
  const onDragEnd = (newList: Record<string, any>[]) => {
    onChange?.(newList);
  };
  const itemsRendered = (
    <>
      {items?.map((item, i) => {
        //多选的话显示的数据是关联数据信息
        const data = multiple ? item[dataName] : item;
        const title = getFromObject(data, fieldNames.title);
        const avatar = getFromObject(data, fieldNames.avatar);
        const description = getFromObject(data, fieldNames.description);
        const itemDom =
          type == 'checkbox' ? (
            <CheckCard
              key={i}
              checked={false}
              title={
                <Typography.Text
                  style={{ width: avatar ? 100 : 140 }}
                  ellipsis={{ tooltip: title }}
                >
                  {title}
                </Typography.Text>
              }
              avatar={isArr(avatar) ? avatar[0].url : avatar}
              description={
                <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
                  {description}
                </Paragraph>
              }
              extra={
                <CloseCircleOutlined
                  onClick={() => {
                    close(i);
                  }}
                />
              }
              style={{
                height: 98,
                marginBottom: 10,
                backgroundColor: token.colorFillQuaternary,
                maxWidth: '100%',
              }}
              className="sa-modal-select-item"
              size={size}
            />
          ) : (
            <Tag
              key={i}
              closable={true}
              onClose={(e) => {
                close(i);
                e.preventDefault();
              }}
            >
              {title}
            </Tag>
          );
        return multiple ? (
          <DragItem item={item} key={i} idName={['data', 'id']} style={{ maxWidth: '100%' }}>
            {itemDom}
          </DragItem>
        ) : (
          itemDom
        );
      })}
      {(multiple && max && max > items.length) || items.length == 0 ? button : ''}
    </>
  );
  return multiple ? (
    <DndKitContext onDragEnd={onDragEnd} list={items} idName={['data', 'id']}>
      <Flex wrap gap="small">
        {itemsRendered}
      </Flex>
    </DndKitContext>
  ) : (
    <>{itemsRendered}</>
  );
};
export const ModalSelectRender = (text, props) => {
  //这不是函数组件 不能使用hook
  //console.log(text, props.record, formRef, formRef.current?.getFieldValue('shop'));
  //获取显示的数据
  const { fieldProps } = props;
  const { name = '', query = {}, multiple = false } = fieldProps;
  return (
    <ModalSelect
      //parseValue={selected ? (multiple ? selected : [selected]) : []}
      {...props.fieldProps}
      //formItemProps={{ ...props.formItemProps }}
      query={query}
    />
  );
};
export default ModalSelect;
