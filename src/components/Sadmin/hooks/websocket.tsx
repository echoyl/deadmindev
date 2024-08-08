import { getAdminToken, rememberName } from '@/components/Sadmin/lib/request';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SaDevContext } from '../dev';
import { isJsonString } from '../helpers';

import ConfirmForm from '../action/confirmForm';
import ButtonModal from '../action/buttonModal';
import TableFromBread from '../tableFromBread';
import cache from '../helper/cache';

// 创建WebSocket上下文
export const WebSocketContext = React.createContext<{
  socket?: WebSocket;
  bind?: (socket?: WebSocket) => void;
  clientId?: string;
  messageData?: { [key: string]: any };
  setMessageData?: (data: any) => void;
}>({});

// 高阶组件，用于在所有子组件中提供WebSocket实例
// const withWebSocket = Comp => props => {
//   const ws = useWebSocket();
//   return <Comp {...props} webSocket={ws} />;
// };

// 自定义钩子，用于管理WebSocket连接
const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket>();
  const socketRef = useRef<WebSocket | null>(null);
  const [isInit, setIsInit] = useState(false);
  const { setting } = useContext(SaDevContext);
  const [timeinterval, setPingInterval] = useState<any>(null);
  const bind = async () => {
    const ws = socketRef.current;
    const token = await getAdminToken();
    const remember = await cache.get(rememberName);
    //console.log('send bind', token, ws, socket);
    if (!token) {
      //未登录不用绑定
      //console.log('no token');
      return;
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'bind', data: { token, remember } }));
    }

    //console.log('send bind', token, ws, socket);
    return;
  };

  const ping = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      //console.log('ping:', setting.adminSetting?.socket?.pingData);
      // 发送消息
      socketRef.current.send(setting.adminSetting?.socket?.pingData);
    }
    return;
  };
  const connect = (): WebSocket | null => {
    const url = setting.adminSetting?.socket?.url;
    //console.log('connect url is ', url);
    const ws = new WebSocket(url);
    setSocket(ws);
    socketRef.current = ws;
    init();
    return ws;
  };
  const init = () => {
    if (!socketRef.current) {
      return;
    }
    const ws = socketRef.current;
    ws.onopen = (e) => {
      setIsInit(true);
      bind();
      console.log('ws is opening');
      ws.onclose = (e) => {
        console.log('ws close and reconnect');
        //connect now
        connect();
      };
    };

    ws.onerror = (e) => {};
  };
  useEffect(() => {
    if (!setting || isInit) {
      return;
    }

    if (!setting.adminSetting?.socket?.open) {
      return () => {};
    }
    connect();

    //增加定时器

    if (setting.adminSetting?.socket?.ping && setting.adminSetting?.socket?.pingInterval) {
      const timeintervalx = setInterval(
        ping,
        parseInt(setting.adminSetting?.socket?.pingInterval) * 1000,
      );

      setPingInterval(timeintervalx);
    }
    return () => clearInterval(timeinterval); //清除定时器

    //return () => ws.close(); // 组件卸载时关闭连接
  }, [setting?.adminSetting?.socket]);
  return { socket, bind };
};

// 使用WebSocketContext提供WebSocket实例
const WebSocketProvider = (props) => {
  const [clientId, setClientId] = useState();
  const [messageData, setMessageData] = useState<{ [key: string]: any }>({});

  const { socket, bind } = useWebSocket();
  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        if (isJsonString(e.data)) {
          const data = JSON.parse(e.data);
          //console.log('on message', data);
          const { type } = data;
          setMessageData(data);
          if (type == 'init') {
            setClientId(data.data);
          }
        }
      };
    }
  }, [socket]);
  return (
    <WebSocketContext.Provider value={{ socket, bind, clientId, messageData, setMessageData }}>
      {props.children}
    </WebSocketContext.Provider>
  );
};

export const WebSocketListen = () => {
  const { messageData } = useContext(WebSocketContext);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalTableOpen, setModalTableOpen] = useState(false);
  type NotificationType = 'success' | 'info' | 'warning' | 'error';
  const { messageApi, notificationApi } = useContext(SaDevContext);
  useEffect(() => {
    if (messageData) {
      const { type, data } = messageData;
      if (type == 'modalForm') {
        setModalFormOpen(true);
      } else if (type == 'modalTable') {
        setModalTableOpen(true);
      } else if (type == 'message' && data?.message) {
        messageApi?.open(data?.message);
      } else if (type == 'notification' && data?.notification) {
        console.log('messageData', messageData);
        const { type: ntype, ...notificationProps } = data?.notification;
        notificationApi?.[ntype as NotificationType]?.({
          ...notificationProps,
          description: (
            <div
              dangerouslySetInnerHTML={{ __html: messageData.data.notification.description }}
            ></div>
          ),
        });
      }
    }
  }, [messageData]);
  return (
    <>
      {messageData?.data?.modalForm && (
        <ConfirmForm
          trigger={<></>}
          open={modalFormOpen}
          onOpen={(open) => {
            setModalFormOpen(open);
          }}
          page={messageData?.data?.modalForm?.page}
          msg={messageData?.data?.modalForm?.title}
          key="modal"
        />
      )}
      {messageData?.data?.modalTable && messageData?.data?.modalTable.page && (
        <ButtonModal
          open={modalTableOpen}
          afterOpenChange={(open) => {
            setModalTableOpen(open);
          }}
          key="tablemodal"
          trigger={<></>}
          title={messageData?.data?.modalTable?.title}
          modalProps={{ footer: null }}
        >
          <TableFromBread
            fieldProps={{ path: messageData.data.modalTable.page }}
            record={{}}
            alwaysenable={true}
          />
        </ButtonModal>
      )}
    </>
  );
};

// 使用WebSocketContext消费WebSocket实例
export const useWs = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWs must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;
