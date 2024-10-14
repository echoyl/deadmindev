import { Card, Flex, Image, Typography } from 'antd';
import useStyles from './style.style';
import { inArray, isObj, isStr } from '../../checkers';
import { TableColumnTitle } from '../../dev/table/title';
import { useEffect, useState } from 'react';
import { DndContext } from '../../dev/dnd-context';
import { SaTableAction } from '../../posts/tableColumns';
import CustomerColumnRender from '../../action/customerColumn';
import { uid } from '../../helpers';
import { CheckCard } from '@ant-design/pro-components';

const CardRender = (props) => {
  const { checkDisable = false, ...restProps } = props;
  //return <Card {...restProps}>{props.children}</Card>;
  return checkDisable ? (
    <Card {...restProps}>{props.children}</Card>
  ) : (
    <>
      {/* <Card style={{ display: 'none' }} /> */}
      <CheckCard bodyStyle={{ padding: 24 }} {...restProps}>
        {props.children}
      </CheckCard>
    </>
  );
};

export default (props) => {
  const { record, devEnable, tableColumns, allProps } = props;
  const { path, openType, editable, deleteable, viewable, setting } = allProps;
  const {
    setting: { card: { grid: { coverImageHeight = 180, descriptionRows = 2 } = {} } = {} },
  } = allProps;
  const { Paragraph } = Typography;
  const { styles } = useStyles();
  const [checkIds, setCheckIds] = useState(allProps?.selectedRowKeys);
  useEffect(() => {
    setCheckIds(allProps?.selectedRowKeys);
  }, [allProps?.selectedRowKeys]);

  const getContent = (index: number, type = 'text', inDiv = false) => {
    const column = tableColumns?.[index];

    if (!column) return;

    const field = column?.dataIndex;
    const { valueType } = column;
    let value = record?.[field];

    if (inArray(valueType, ['option', 'customerColumn']) >= 0) {
      //处理类型
      switch (valueType) {
        case 'option':
          value = (
            <SaTableAction
              record={record}
              path={path}
              openType={openType}
              level={1}
              editable={editable}
              deleteable={deleteable}
              viewable={viewable}
            />
          );
          break;
        case 'customerColumn':
          value = (
            <CustomerColumnRender
              {...column?.fieldProps}
              type="table"
              record={record}
              text={record?.[field]}
            />
          );
      }
      value = (
        <div
          onClick={(domEvent) => {
            domEvent.stopPropagation();
          }}
        >
          {value}
        </div>
      );
    } else {
      if (type == 'image') {
        value = (
          <Image
            className="card_cover_image"
            height={coverImageHeight}
            width="100%"
            src={isStr(value) ? value : value?.[0]?.url}
            placeholder={true}
            preview={false}
          />
        );
      } else {
        value = isObj(value) ? JSON.stringify(value) : value;
      }
    }

    value = inDiv ? (
      <div className="card_item_content_item" key={field ? field : uid()}>
        {value}
      </div>
    ) : (
      value
    );

    return devEnable ? (
      <TableColumnTitle key={field ? field : uid()} {...column} title={value} />
    ) : (
      value
    );
  };
  //console.log('devEnable', devEnable);
  return (
    <DndContext>
      <CardRender
        checkDisable={setting?.checkDisable}
        className={[styles.card, 'ant-card']}
        value={record?.id}
        checked={inArray(record.id, checkIds) > -1}
        onChange={(v: boolean) => {
          let oldkeys = allProps?.selectedRowKeys;
          const index = inArray(record.id, oldkeys);
          if (v) {
            if (index < 0) {
              oldkeys?.push(record.id);
            }
          } else {
            if (index > -1) {
              oldkeys?.splice(index, 1);
            }
          }
          //setCheckIds([...oldkeys]);
          allProps?.setSelectedRowKeys?.([...oldkeys]);
        }}
        cover={getContent(0, 'image')}
      >
        <Card.Meta
          title={<a>{getContent(1)}</a>}
          description={
            <Paragraph
              ellipsis={{
                rows: descriptionRows,
              }}
            >
              {getContent(2)}
            </Paragraph>
          }
        />
        <Flex className={styles.cardItemContent} justify="space-between" align="center">
          {tableColumns
            ?.map((v, i) => {
              if (i > 2) {
                return getContent(i, 'text', true);
              }
              return false;
            })
            .filter((v) => v !== false)}
        </Flex>
      </CardRender>
    </DndContext>
  );
};
