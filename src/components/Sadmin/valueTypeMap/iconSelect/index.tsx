// 导入图标库
import * as Icon from '@ant-design/icons';
import { css } from '@emotion/css';
import { Card, Flex, Segmented, Select, theme } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SaDevContext } from '../../dev';
import { isFunction } from 'es-toolkit';
// 编写生成ReactNode的方法

export const iconToElement = (name: string, style = {}) => {
  //做一个map兼容之前的设置
  const IconFont = Icon.createFromIconfontCN();
  const map = {
    dashboard: 'DashboardOutlined',
    table: 'TableOutlined',
    setting: 'SettingOutlined',
    questionCircle: 'QuestionCircleOutlined',
    wechat: 'WechatOutlined',
    menu: 'MenuOutlined',
    lock: 'LockOutlined',
    shop: 'ShopOutlined',
    user: 'UserOutlined',
    accountBook: 'AccountBookOutlined',
    global: 'GlobalOutlined',
    tag: 'TagOutlined',
    crown: 'CrownOutlined',
    nodeIndex: 'NodeIndexOutlined',
    barChart: 'BarChartOutlined',
    gift: 'GiftOutlined',
    add: 'PlusCircleOutlined',
    edit: 'EditOutlined',
    download: 'DownloadOutlined',
    check: 'CheckCircleOutlined',
    close: 'CloseCircleOutlined',
    clock: 'ClockCircleOutlined',
    down: 'DownOutlined',
    printer: 'PrinterOutlined',
    car: 'CarOutlined',
    environment: 'EnvironmentOutlined',
    search: 'SearchOutlined',
    form: 'FormOutlined',
    copy: 'CopyOutlined',
    exception: 'ExceptionOutlined',
    delete: 'DeleteOutlined',
    rollback: 'RollbackOutlined',
    paycircle: 'PayCircleOutlined',
  };
  if (map[name]) {
    name = map[name];
  }
  return Icon[name] ? (
    React.createElement(Icon[name], {
      style,
      key: name,
    })
  ) : name ? (
    <IconFont type={name} />
  ) : null;
};

const getIcons = (iconfont: Record<string, any> | undefined) => {
  const icons = [
    {
      value: 'Outlined',
      label: '线框风格',
      icons: [],
    },
    {
      value: 'Filled',
      label: '实底风格',
      icons: [],
    },
    {
      value: 'TwoTone',
      label: '双色风格',
      icons: [],
    },
  ];
  for (var name in Icon) {
    if (!isFunction(Icon[name]) && name != 'default') {
      for (var cate in icons) {
        if (name.indexOf(icons[cate].value) > -1) {
          icons[cate].icons.push(name);
        }
      }
    }
  }
  if (iconfont?.json) {
    icons.push({
      value: 'IconFont',
      label: 'IconFont',
      icons: iconfont?.json?.glyphs?.map((v) =>
        [iconfont?.json.css_prefix_text, v.font_class].join(''),
      ),
    });
  }

  //console.log('get icons once');
  return icons;
};

const IconSelectPanel = (props) => {
  const { token } = theme.useToken();
  const iconSelectItem = css`
    text-align: center;
    font-size: 18px;
    cursor: pointer;
    height: 24px;
    width: 24px;
    line-height: 24px;
    &:hover {
      color: ${token.colorPrimaryActive};
    }
    &.hover {
      color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
    }
  `;
  const { keyword, onChange, value, inputRef } = props;
  const [type, setType] = useState<string | number>('Outlined');
  const [icons, setAllIcons] = useState([]);
  const [showIcons, setShowIcons] = useState<Array<any>>([]);
  const [selectName, setSelectName] = useState(value);
  const { setting } = useContext(SaDevContext);
  useEffect(() => {
    if (icons.length < 1) {
      setAllIcons(getIcons(setting?.adminSetting?.iconfont));
    }
    setShowIcons(getIconsByCate(type));
  }, [keyword, icons]);
  const getIconsByCate = (cate: string | number) => {
    const ics = icons.find((v) => v.value == cate);
    //console.log('getIconsByCate', ics);
    if (ics) {
      if (keyword) {
        return ics?.icons?.filter((v) => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
      } else {
        return ics?.icons;
      }
    } else {
      return [];
    }
  };
  return (
    <Card
      style={{ minWidth: 400 }}
      bordered={false}
      title={
        <Segmented
          value={type}
          onChange={(value) => {
            setType(value);
            inputRef?.current?.focus();
            const ics = icons.find((v) => v.value == value);
            if (ics) {
              setShowIcons(getIconsByCate(value));
            }
          }}
          options={icons}
        />
      }
    >
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        <Flex wrap="wrap" gap="small">
          {showIcons.map((name) => {
            const icon = iconToElement(name);
            return (
              <div
                className={[iconSelectItem, selectName == name ? 'hover' : ''].join(' ')}
                title={name}
                key={name}
                onClick={(e) => {
                  inputRef?.current?.focus();
                  onChange?.(name);
                  setSelectName(name);
                  e.stopPropagation();
                }}
              >
                {icon}
              </div>
            );
          })}
        </Flex>
      </div>
    </Card>
  );
};

const IconSelectInput = (props) => {
  const { value: uvalue, onChange: uonChang } = props;
  const [searchVal, setSeachVal] = useState();
  const [value, setValue] = useState<{ [key: string]: any } | null>();
  const [open, setOpen] = useState(false);
  const selectRef = useRef();
  const onChange = (value) => {
    //console.log('panel change', value);
    uonChang(value);
    setOpen(false);
    //selectRef?.current?.blur();
  };
  useEffect(() => {
    //console.log('uvalue change', uvalue);
    if (uvalue) {
      setValue({
        value: uvalue,
        label: (
          <>
            {iconToElement(uvalue)} - {uvalue}
          </>
        ),
      });
    } else {
      setValue(null);
    }
  }, [uvalue]);
  return (
    <Select
      open={open}
      allowClear
      showSearch
      placeholder="请选择图标"
      onSearch={(v) => {
        setSeachVal(v);
      }}
      onClear={() => {
        uonChang('');
      }}
      onDropdownVisibleChange={(open) => {
        setOpen(open);
      }}
      value={value}
      style={{ width: '100%', minWidth: 100 }}
      dropdownStyle={{ minWidth: 400 }}
      dropdownRender={() => {
        return (
          <IconSelectPanel
            keyword={searchVal}
            value={uvalue}
            onChange={onChange}
            inputRef={selectRef}
          />
        );
      }}
    />
  );
};

export const IconSelectRel = (props) => {
  const { value: pvalue = '', onChange, width } = props;
  const [value, setValue] = useState(pvalue);

  return (
    <div style={{ width }}>
      <IconSelectInput
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
      />
    </div>
  );
};

const IconSelect = (_, props) => {
  const { fieldProps } = props;
  return <IconSelectRel {...fieldProps} />;
};

export const IconSelectRender = (_, props) => {
  return _ ? <>{iconToElement(_)}</> : null;
};

export default IconSelect;
