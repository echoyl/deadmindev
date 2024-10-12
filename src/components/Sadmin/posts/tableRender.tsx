import { ProTable } from '@ant-design/pro-components';
import SaList from '../components/SaList';
export default (props) => {
  const { showType = 'table', tableColumns, devEnable, allProps, ...retProps } = props;
  const { setting } = allProps;

  return setting?.showType == 'card' ? (
    <SaList {...retProps} devEnable={devEnable} tableColumns={tableColumns} allProps={allProps} />
  ) : (
    <ProTable {...retProps} />
  );
};
