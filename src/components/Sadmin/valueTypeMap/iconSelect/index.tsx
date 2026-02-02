// 导入图标库
import * as Icon from '@ant-design/icons';
import { css } from '@emotion/css';
import { Card, Flex, Segmented, Select, theme } from 'antd';
import { isFunction } from 'es-toolkit';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SaDevContext } from '../../dev';
// 编写生成ReactNode的方法

export const iconToElement = (iname: string, style = {}) => {
  //做一个map兼容之前的设置
  const IconFont = Icon.createFromIconfontCN();
  const map: Record<string, string> = {
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
  const name = map[iname] || iname;
  const iconName = name as keyof typeof Icon;
  return Icon[iconName] ? (
    React.createElement(Icon[iconName] as React.ComponentType<any>, {
      style,
      key: name,
    })
  ) : name ? (
    <IconFont type={name} />
  ) : null;
};

const getIcons = (iconfont: Record<string, any> | undefined): Record<string, any>[] => {
  const icons: Record<string, any>[] = [
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
  const keys: string[] = Object.keys(Icon).filter(
    (name) => !isFunction((Icon as any)[name]) && name != 'default',
  );
  keys.forEach((name) => {
    icons.forEach((cate) => {
      if (name.indexOf(cate.value) > -1) {
        cate.icons.push(name);
      }
    });
  });
  const iconfontIcons = iconfont?.json
    ? {
        value: 'IconFont',
        label: 'IconFont',
        icons: iconfont?.json?.glyphs?.map((v: Record<string, any>) =>
          [iconfont?.json.css_prefix_text, v.font_class].join(''),
        ),
      }
    : {};
  return [...icons, iconfontIcons].filter((v) => v.value);
};

const IconSelectPanel = (props: any) => {
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
  const [icons, setAllIcons] = useState<Record<string, any>[]>([]);
  const [showIcons, setShowIcons] = useState<any[]>([]);
  const [selectName, setSelectName] = useState(value);
  const { setting } = useContext(SaDevContext);
  const getIconsByCate = (cate: string | number) => {
    const ics = icons.find((v) => v.value == cate);
    //console.log('getIconsByCate', ics);
    if (ics) {
      if (keyword) {
        return ics?.icons?.filter(
          (v: string) => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1,
        );
      } else {
        return ics?.icons;
      }
    } else {
      return [];
    }
  };
  useEffect(() => {
    if (icons.length < 1) {
      setAllIcons(getIcons(setting?.adminSetting?.iconfont));
    }
    setShowIcons(getIconsByCate(type));
  }, [keyword, icons]);
  return (
    <Card
      style={{ minWidth: 400 }}
      variant="borderless"
      title={
        <Segmented
          value={type}
          onChange={(val: string | number) => {
            setType(val);
            inputRef?.current?.focus();
            const ics = icons.find((v: Record<string, any>) => v.value == val);
            if (ics) {
              setShowIcons(getIconsByCate(val));
            }
          }}
          options={icons.map((v) => v.value)}
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

const IconSelectInput = (props: any) => {
  const { value: uvalue, onChange: uonChang, size = 'middle' } = props;
  const [searchVal, setSeachVal] = useState<string>();
  const [value, setValue] = useState<Record<string, any> | null>();
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  const onChange = (v: string | number) => {
    uonChang(v);
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
      size={size}
      open={open}
      allowClear
      placeholder="请选择图标"
      showSearch={{
        onSearch: (v) => {
          setSeachVal(v);
        },
      }}
      onClear={() => {
        uonChang('');
      }}
      onOpenChange={(iopen: boolean) => {
        setOpen(iopen);
      }}
      value={value}
      style={{ width: '100%', minWidth: 100 }}
      styles={{ popup: { root: { minWidth: 400 } } }}
      popupRender={() => {
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

export const IconSelectRel = (props: any) => {
  const { value: pvalue = '', onChange, width, size } = props;
  const [value, setValue] = useState(pvalue);

  return (
    <div style={{ width }}>
      <IconSelectInput
        size={size}
        value={value}
        onChange={(v: string) => {
          setValue(v);
          onChange?.(v);
        }}
      />
    </div>
  );
};

const IconSelect = (_: any, props: any) => {
  const { fieldProps } = props;
  return <IconSelectRel {...fieldProps} />;
};

export const IconSelectRender = (_: any) => {
  return _ ? <>{iconToElement(_)}</> : null;
};

export default IconSelect;
