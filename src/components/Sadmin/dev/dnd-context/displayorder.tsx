import request from '../../lib/request';
import { notification } from '../../message';

const sortDragEnd = (url: string, callback?: (list: Record<string, any>[] | any[]) => void) => {
  return (list: Record<string, any>[] | any[], more?: Record<string, any>) => {
    const {
      change = false,
      event: { active, over },
    } = more || {};
    if (!change) {
      //未改变位置
      return;
    }
    request
      .post(url, {
        data: {
          actype: 'dragSort',
          active: { id: active.id },
          over: { id: over.id },
        },
        then: ({ code, msg }) => {
          if (code) {
            notification.error({ description: msg, message: '提示' });
          }
        },
      })
      .then(() => {
        callback?.(list);
      });
  };
};
export default sortDragEnd;
