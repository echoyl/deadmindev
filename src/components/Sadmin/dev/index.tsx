import {
  AntDesignOutlined,
  DatabaseOutlined,
  FileMarkdownOutlined,
  MenuOutlined,
  MoreOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Link, useModel } from '@umijs/max';
import { Dropdown, FloatButton, Space } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { createContext, useContext, useState } from 'react';
import ModalJson from '../action/modalJson';
import Refresh from '../components/refresh';
import { HookAPI } from 'antd/es/modal/useModal';
import { NotificationInstance } from 'antd/es/notification/interface';
import DevSwitch from './switch';
import { ToolMenuForm } from './table/toolbar';

export const SaDevContext = createContext<{
  setting?: any;
  setSetting?: (setting: any) => void;
  // admin?: any;
  // setAdmin?: (admin: any) => void;
  messageApi?: MessageInstance;
  modalApi?: HookAPI;
  notificationApi?: NotificationInstance;
  isMobile?: Boolean;
}>({});

export const DevLinks = () => {
  // const [open, setOpen] = useState(false);
  const items = [
    {
      key: 'menu',
      label: (
        <Link
          key="menu"
          style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}
          to={'/dev/menu'}
        >
          <Space>
            <MenuOutlined />
            菜单
          </Space>
        </Link>
      ),
    },
    {
      key: 'model',
      label: (
        <Link
          to={'/dev/model'}
          style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}
          key="model"
        >
          <Space>
            <DatabaseOutlined />
            模型
          </Space>
        </Link>
      ),
    },
    {
      key: 'setting',
      label: (
        <Link
          to={'/dev/setting'}
          style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}
          key="setting"
        >
          <Space>
            <SettingOutlined />
            配置
          </Space>
        </Link>
      ),
    },
    // {
    //   key: 'refresh',
    //   label: <Refresh key="refresh" />,
    // },
    {
      key: 'json',
      label: (
        <ModalJson
          trigger={
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Space>
                <ToolOutlined />
                JSON
              </Space>
            </div>
          }
        />
      ),
    },
    {
      key: 'docs',
      label: (
        <a
          href={'https://echoyl.com'}
          style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}
          key="setting"
          target={'_blank'}
        >
          <Space>
            <FileMarkdownOutlined />
            文档
          </Space>
        </a>
      ),
    },
    {
      key: 'addmenu',
      label: (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <ToolMenuForm
            key="devsetting"
            trigger={
              <Space>
                <PlusSquareOutlined />
                菜单
              </Space>
            }
          />
        </div>
      ),
    },
  ];

  const children = (
    <>
      <Dropdown menu={{ items }} key="more" arrow={{ pointAtCenter: true }} placement="top">
        <FloatButton icon={<MoreOutlined />} />
      </Dropdown>
      <Refresh key="refresh" />
      <DevSwitch key="DevSwitch" />
    </>
  );
  return (
    <>
      <FloatButton.Group
        //open={true}
        //trigger="click"
        icon={<AntDesignOutlined />}
        badge={{ dot: true }}
        //onOpenChange={(open) => setOpen(open)}
        style={{ insetBlockEnd: 75 }}
      >
        {children}
      </FloatButton.Group>
    </>
  );
};
