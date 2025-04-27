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
import { Link, useLocation } from '@umijs/max';
import { Dropdown, FloatButton, Image, Popover, Space } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { createContext, useContext } from 'react';
import ModalJson from '../action/modalJson';
import Refresh from '../components/refresh';
import { HookAPI } from 'antd/es/modal/useModal';
import { NotificationInstance } from 'antd/es/notification/interface';
import DevSwitch from './switch';
import { ToolMenuForm } from './table/toolbar';
import { iconToElement } from '../valueTypeMap/iconSelect';
import { getFromObject } from '../helpers';
import { trim } from 'es-toolkit';
import { isUrl } from '@ant-design/pro-components';

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

  const children = [
    <Dropdown menu={{ items }} key="more" arrow={{ pointAtCenter: true }} placement="top">
      <FloatButton icon={<MoreOutlined />} />
    </Dropdown>,
    <Refresh key="refresh" />,
    <DevSwitch key="DevSwitch" />,
  ];

  const AlertImg = (props) => {
    const { item = {} } = props;
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

  const LinkRender = (props) => {
    const { item = {}, type = 'icon' } = props;
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
    const floatButtons = setting?.adminSetting?.floatButton?.items?.map((item, i) => {
      const { type, icon } = item;
      if (type == 'alertimg') {
        //弹出图片
        return <AlertImg item={item} key={i} />;
      } else if (type == 'link') {
        return <LinkRender key={i} item={item} type={'icon'} />;
      } else if (type == 'floatmenu') {
        const items = item?.menus?.map((menu, i) => {
          return {
            key: i,
            label: <LinkRender key={i} item={menu} type={'menu'} />,
          };
        });
        return (
          <Dropdown menu={{ items }} key={i} arrow={{ pointAtCenter: true }} placement="top">
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
