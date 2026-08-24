import { ProTable } from '@ant-design/pro-components';
import SaList from '../components/SaList';
export default (props: Record<string, any>) => {
  const { showType = 'table', tableColumns, devEnable, allProps, initRequest, ...retProps } = props;
  const { setting } = allProps;
  //const { search } = retProps;

  if (setting?.showType == 'card') {
    return (
      <SaList {...retProps} devEnable={devEnable} tableColumns={tableColumns} allProps={allProps} />
    );
  } else {
    const table = <ProTable {...retProps} />;
    return table;
    //这里修改为直接返回组件，之前为什么在请求前后有样式问题未记录，但是会导致如果没有search导致table的全屏高度问题
    // return search ? (
    //   table
    // ) : (
    //   <ProCard
    //     variant="borderless"
    //     styles={{
    //       body: initRequest
    //         ? { paddingBlock: 0, paddingInline: 0, paddingBlockEnd: 0 }
    //         : { paddingBlock: 0, paddingBlockEnd: 16 },
    //     }}
    //   >
    //     {table}
    //   </ProCard>
    // );
  }
};
