import { BellOutlined } from '@ant-design/icons';
import { Badge, Spin, Tabs, theme } from 'antd';
import classNames from 'classnames';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import React from 'react';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import type { NoticeIconTabProps } from './NoticeList';
import NoticeList from './NoticeList';
import { createStyles } from 'antd-style';
import { useStyle } from './style';
import { actionDefaultStyle } from '../RightContent';
const { TabPane } = Tabs;

export type NoticeIconProps = {
  count?: number;
  bell?: React.ReactNode;
  className?: string;
  loading?: boolean;
  onClear?: (tabName: string, tabKey: string) => void;
  onItemClick?: (item: API.NoticeIconItem, tabProps: NoticeIconTabProps) => void;
  onViewMore?: (tabProps: NoticeIconTabProps, e: MouseEvent) => void;
  onTabChange?: (tabTile: string) => void;
  style?: React.CSSProperties;
  onPopupVisibleChange?: (visible: boolean) => void;
  popupVisible?: boolean;
  clearText?: string;
  viewMoreText?: string;
  clearClose?: boolean;
  emptyImage?: string;
  children?: React.ReactElement<NoticeIconTabProps>[];
};

const NoticeIcon: React.FC<NoticeIconProps> & {
  Tab: typeof NoticeList;
} = (props) => {
  const { useToken } = theme;
  const { token } = useToken();
  const getNotificationBox = (): React.ReactNode => {
    const {
      children,
      loading,
      onClear,
      onTabChange,
      onItemClick,
      onViewMore,
      clearText,
      viewMoreText,
    } = props;
    if (!children) {
      return null;
    }
    const items: any = [];
    React.Children.forEach(children, (child: React.ReactElement<NoticeIconTabProps>): void => {
      if (!child) {
        return;
      }
      const { list, title, count, tabKey, showClear, showViewMore } = child.props;
      const len = list && list.length ? list.length : 0;
      const msgCount = count || count === 0 ? count : len;
      const tabTitle: string = msgCount > 0 ? `${title} (${msgCount})` : title;
      items.push({
        label: tabTitle,
        key: tabKey,
        children: (
          <NoticeList
            clearText={clearText}
            viewMoreText={viewMoreText}
            list={list}
            tabKey={tabKey}
            onClear={(): void => onClear && onClear(title, tabKey)}
            onClick={(item): void => onItemClick && onItemClick(item, child.props)}
            onViewMore={(event): void => onViewMore && onViewMore(child.props, event)}
            showClear={showClear}
            showViewMore={showViewMore}
            title={title}
          />
        ),
      });
    });

    return (
      <>
        <Spin spinning={loading} delay={300}>
          <div
            style={{
              boxShadow:
                '0 6px 16px -8px rgba(0,0,0,.08), 0 9px 28px 0 rgba(0,0,0,.05), 0 12px 48px 16px rgba(0,0,0,.03)',
              borderRadius: 4,
              background: token.colorBgBase,
            }}
          >
            <Tabs onChange={onTabChange} centered items={items} />
          </div>
        </Spin>
      </>
    );
  };

  const { className, count, bell } = props;

  const [visible, setVisible] = useMergedState<boolean>(false, {
    value: props.popupVisible,
    onChange: props.onPopupVisibleChange,
  });

  const notificationBox = getNotificationBox();
  const prefixCls = 'header-bell';
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const NoticeBellIcon = bell || <BellOutlined />;
  const trigger = (
    <Badge
      styles={{ root: { ...actionDefaultStyle, color: token.colorTextTertiary } }}
      count={count}
      size="small"
      offset={[-10, 10]}
    >
      {NoticeBellIcon}
    </Badge>
  );

  if (!notificationBox) {
    return trigger;
  }

  return wrapSSR(
    <HeaderDropdown
      className={`${prefixCls} ${hashId}`}
      placement="bottomRight"
      dropdownRender={getNotificationBox}
      overlayClassName={styles.popover}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}
    >
      {trigger}
    </HeaderDropdown>,
  );
};

// NoticeIcon.defaultProps = {
//   emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
// };
NoticeIcon.emptyImage = 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg';

NoticeIcon.Tab = NoticeList;

export default NoticeIcon;
