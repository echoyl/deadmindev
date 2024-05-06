import {
  DatabaseOutlined,
  FileMarkdownOutlined,
  MenuOutlined,
  MoreOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { ProConfigProvider, ProProvider } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Dropdown, Space } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { createContext, useContext } from 'react';
import ModalJson from '../action/modalJson';
import { saValueTypeMap } from '../helpers';
import Refresh from '../refresh';
import { ToolBarMenu, ToolMenuForm } from './table/toolbar';

export const SaDevContext = createContext<{
  setting?: any;
  setSetting?: (setting: any) => void;
  admin?: any;
  setAdmin?: (admin: any) => void;
  messageApi?: MessageInstance;
}>({});

export const DevLinks = () => {
  const values = useContext(ProProvider);
  const items = [
    {
      key: 'menu',
      label: (
        <Link
          key="menu"
          style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}
          to={'dev/menu'}
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
          to={'dev/model'}
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
          to={'dev/setting'}
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
    {
      key: 'refresh',
      label: <Refresh key="refresh" />,
    },
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
  ];
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Dropdown menu={{ items }} key="more" arrow={{ pointAtCenter: true }} placement="top">
        <Button type="text" style={{ width: '100%' }} icon={<MoreOutlined />}>
          更多
        </Button>
      </Dropdown>

      <ProConfigProvider {...values} valueTypeMap={{ ...saValueTypeMap }}>
        <ToolMenuForm
          key="devsetting"
          trigger={
            <Button type="text" style={{ width: '100%' }} icon={<PlusSquareOutlined />}>
              菜单
            </Button>
          }
        />
      </ProConfigProvider>
    </Space>
  );
};
