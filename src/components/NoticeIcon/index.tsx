import request from '@/components/Sadmin/lib/request';
import { useModel } from '@umijs/max';
import { message, Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';
import NoticeIcon from './NoticeIcon';
import { groupBy } from 'es-toolkit';
dayjs.extend(relativeTime);
export type GlobalHeaderRightProps = {
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
};

const getNoticeData = (notices: API.NoticeIconItem[]): Record<string, API.NoticeIconItem[]> => {
  if (!notices || notices.length === 0 || !Array.isArray(notices)) {
    return {};
  }

  const newNotices = notices.map((notice) => {
    const newNotice = { ...notice };

    if (newNotice.datetime) {
      newNotice.datetime = dayjs(notice.datetime as string).fromNow();
    }

    if (newNotice.id) {
      newNotice.key = newNotice.id;
    }

    if (newNotice.extra && newNotice.status) {
      const color = {
        todo: '',
        processing: 'blue',
        urgent: 'red',
        doing: 'gold',
      }[newNotice.status];
      newNotice.extra = (
        <Tag
          color={color}
          style={{
            marginRight: 0,
          }}
        >
          {newNotice.extra}
        </Tag>
      ) as any;
    }

    return newNotice;
  });
  return groupBy(newNotices, (item) => item.type);
};

const getUnreadData = (noticeData: Record<string, API.NoticeIconItem[]>) => {
  const unreadMsg: Record<string, number> = {};
  Object.keys(noticeData).forEach((key) => {
    const value = noticeData[key];

    if (!unreadMsg[key]) {
      unreadMsg[key] = 0;
    }

    if (Array.isArray(value)) {
      unreadMsg[key] = value.filter((item) => !item.read).length;
    }
  });
  return unreadMsg;
};

const NoticeIconView: React.FC = (props) => {
  const { initialState } = useModel('@@initialState');
  const { style } = props;
  //const { currentUser } = initialState || {};
  const [notices, setNotices] = useState<API.NoticeIconItem[]>([]);
  //const { data } = useRequest(getNotices);

  // useEffect(() => {
  //   setNotices(data || []);
  //   //setNotices([]);
  // }, [data]);

  //添加定时任务获取后台消息提醒
  useEffect(() => {
    const timeout = async () => {
      const { data } = await request.get('notice');
      setNotices(data || []);
      setTimeout(timeout, 180000); //3分钟检测一次消息提醒
    };
    if (!initialState?.settings?.adminSetting?.dev) {
      timeout();
    }
  }, []);

  const noticeData = getNoticeData(notices);
  const unreadMsg = getUnreadData(noticeData || {});

  const changeReadState = async (id: string) => {
    const { code } = await request.get('clearNotice', { params: { id: id } });
    if (!code) {
      setNotices(
        notices.map((item) => {
          const notice = { ...item };
          if (notice.id === id) {
            notice.read = true;
          }
          return notice;
        }),
      );
    }
  };

  const clearReadState = async (title: string, key: string) => {
    const { code } = await request.get('clearNotice', { params: { type: key } });
    if (!code) {
      setNotices(
        notices.map((item) => {
          const notice = { ...item };
          if (notice.type === key) {
            notice.read = true;
          }
          return notice;
        }),
      );
    }
    message.success(`${'清空了'} ${title}`);
  };

  return (
    <NoticeIcon
      count={notices.filter((item) => !item.read).length}
      onItemClick={(item) => {
        changeReadState(item.id!);
      }}
      onClear={(title: string, key: string) => clearReadState(title, key)}
      loading={false}
      clearText="清空"
      //viewMoreText="查看更多"
      onViewMore={() => message.info('Click on view more')}
      clearClose
      style={style}
    >
      <NoticeIcon.Tab
        tabKey="notification"
        count={unreadMsg.notification}
        list={noticeData.notification}
        title="通知"
        emptyText="你已查看所有通知"
        showViewMore
      />
      <NoticeIcon.Tab
        tabKey="message"
        count={unreadMsg.message}
        list={noticeData.message}
        title="消息"
        emptyText="您已读完所有消息"
        showViewMore
      />
      <NoticeIcon.Tab
        tabKey="event"
        title="待办"
        emptyText="你已完成所有待办"
        count={unreadMsg.event}
        list={noticeData.event}
        showViewMore
      />
    </NoticeIcon>
  );
};

export default NoticeIconView;
