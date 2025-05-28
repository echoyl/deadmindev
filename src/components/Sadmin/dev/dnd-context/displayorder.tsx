import request from '../../lib/request';
import { notification } from '../../message';

const sortDragEnd = (
  url: string,
  oldList: Record<string, any>[] | any[],
  callback?: (list: Record<string, any>[] | any[]) => void,
) => {
  return (list: Record<string, any>[] | any[], more?: Record<string, any>) => {
    const {
      change = false,
      event: { active, over },
    } = more || {};
    if (!change) {
      //未改变位置
      return;
    }
    callback?.(list); //直接修改位置，如果放到请求后面 会有闪烁卡顿
    request.post(url, {
      data: {
        actype: 'dragSort',
        active: { id: active.id },
        over: { id: over.id },
      },
      then: ({ code, msg }) => {
        if (code) {
          notification.error({ description: msg, message: '提示' });
          //错误后将数据设置回
          callback?.([...oldList]);
        }
      },
    });
    // .then(() => {
    //   callback?.(list);
    // });
  };
};
export default sortDragEnd;
