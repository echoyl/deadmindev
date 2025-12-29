import {
  DatabaseOutlined,
  FileMarkdownOutlined,
  MenuOutlined,
  MoreOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { isUrl } from '@ant-design/pro-components';
import { Link, useLocation } from '@umijs/max';
import { Dropdown, FloatButton, Image, Popover, Space } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { HookAPI } from 'antd/es/modal/useModal';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { trim } from 'es-toolkit';
import { createContext, useContext } from 'react';
import ConfirmForm from '../action/confirmForm';
import Refresh from '../components/refresh';
import { getFromObject } from '../helpers';
import { iconToElement } from '../valueTypeMap/iconSelect';
import DevSwitch from './switch';
import { ToolMenuForm } from './table/toolbar';

export const SaDevContext = createContext<{
  setting?: any;
  setSetting?: (setting: any) => void;
  devData?: any;
  setDevData?: (setting: any) => void;
  // admin?: any;
  // setAdmin?: (admin: any) => void;
  messageApi?: MessageInstance;
  modalApi?: HookAPI;
  notificationApi?: NotificationInstance;
  isMobile?: boolean;
}>({});

export const SaDevDataContext = createContext<{
  devData?: any;
  setDevData?: (setting: any) => void;
}>({});

export const DevLinks = (props: any) => {
  // const [open, setOpen] = useState(false);
  const { setting } = useContext(SaDevContext);
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
        <ConfirmForm
          msg="JsonEditor"
          trigger={
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Space>
                <ToolOutlined />
                JSON
              </Space>
            </div>
          }
          formColumns={[
            { dataIndex: 'json', valueType: 'jsonEditor', fieldProps: { height: 426 } },
          ]}
          saFormProps={{ devEnable: false, showTabs: false }}
          readonly={true}
          width={1000}
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
          rel="noreferrer"
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

  const children = [
    <Dropdown menu={{ items }} key="more" arrow={{ pointAtCenter: true }} placement="top">
      <FloatButton icon={<MoreOutlined />} />
    </Dropdown>,
    <Refresh key="refresh" />,
    <DevSwitch key="DevSwitch" />,
  ];

  const AlertImg = (iprops: Record<string, any>) => {
    const { item = {} } = iprops;
    const { icon, width = 150, height = 150 } = item;
    return (
      <Popover
        placement="left"
        content={
          <Image width={width} height={height} src={getFromObject(item, ['img', 0, 'url'])} />
        }
      >
        <FloatButton icon={iconToElement(icon)} />
      </Popover>
    );
  };

  const LinkRender = (iprops: Record<string, any>) => {
    const { item = {}, type = 'icon' } = iprops;
    const { icon, title, link, target } = item;
    const iconElement = iconToElement(icon);
    const tolink = isUrl(link) ? link : `${setting.adminSetting?.baseurl}${trim(link, '/')}`;
    const style = { display: 'inline-block', width: '100%', textAlign: 'center' };
    return type == 'menu' ? (
      isUrl(link) ? (
        <a href={link} style={style} target={target}>
          <Space>
            {iconElement}
            {title}
          </Space>
        </a>
      ) : (
        <Link to={link} target={target} style={style}>
          <Space>
            {iconElement}
            {title}
          </Space>
        </Link>
      )
    ) : (
      <FloatButton icon={iconElement} href={tolink} target={target} />
    );
  };

  const getFloatButton = () => {
    const floatButtons = setting?.adminSetting?.floatButton?.items?.map((item, i: number) => {
      const { type, icon } = item;
      if (type == 'alertimg') {
        //弹出图片
        return <AlertImg item={item} key={i} />;
      } else if (type == 'link') {
        return <LinkRender key={i} item={item} type={'icon'} />;
      } else if (type == 'floatmenu') {
        const iitems = item?.menus?.map((menu, index: number) => {
          return {
            key: i,
            label: <LinkRender key={index} item={menu} type={'menu'} />,
          };
        });
        return (
          <Dropdown
            menu={{ items: iitems }}
            key={i}
            arrow={{ pointAtCenter: true }}
            placement="top"
          >
            <FloatButton icon={iconToElement(icon)} />
          </Dropdown>
        );
      }
      return null;
    });
    return floatButtons;
  };
  const localtion = useLocation();
  const paths = trim(localtion.pathname, '/')?.split('/');
  const inDevPage = paths?.[0] == 'dev';
  const { shape = 'circle' } = setting?.adminSetting?.floatButton || {};
  return (
    <FloatButton.Group shape={shape} style={{ insetBlockEnd: 75 }}>
      {getFloatButton()}
      {setting?.adminSetting?.dev || inDevPage ? children : null}
    </FloatButton.Group>
  );
};
