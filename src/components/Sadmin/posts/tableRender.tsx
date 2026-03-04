import { ProCard, ProTable } from '@ant-design/pro-components';
import SaList from '../components/SaList';
export default (props) => {
  const { showType = 'table', tableColumns, devEnable, allProps, initRequest, ...retProps } = props;
  const { setting } = allProps;
  const { search } = retProps;

  if (setting?.showType == 'card') {
    return (
      <SaList {...retProps} devEnable={devEnable} tableColumns={tableColumns} allProps={allProps} />
    );
  } else {
    const table = <ProTable {...retProps} />;
    return search ? (
      table
    ) : (
      <ProCard
        variant="borderless"
        styles={{
          body: initRequest
            ? { paddingBlock: 0, paddingInline: 0, paddingBlockEnd: 0 }
            : { paddingBlock: 0, paddingBlockEnd: 16 },
        }}
      >
        {table}
      </ProCard>
    );
  }
};
