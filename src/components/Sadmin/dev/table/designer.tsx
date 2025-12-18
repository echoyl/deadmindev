import request from '@/components/Sadmin/lib/request';
import { useModel } from '@umijs/max';
import type { DropdownProps, GetProp } from 'antd';
import { Dropdown } from 'antd';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useTransition } from 'react';
import { DevJsonContext } from '../../jsonForm';

export type tableDesignerInstance = {
  type?: 'table' | 'form' | 'panel';
  pageMenu?: Record<string, any>;
  sort?: (id: number, cls: any[], type: string) => void;
  sortFormColumns?: (id: number, cls: any[]) => void;
  setColumns?: any;
  getColumnsRender?: any;
  add?: (data: Record<string, any>) => void;
  addUrl?: string;
  edit?: (data: Record<string, any>) => void;
  editUrl?: string;
  reflush?: (data: Record<string, any>) => void;
  deleteUrl?: string;
  delete?: (data: Record<string, any>) => void;
  devEnable?: boolean; //开启的必要条件
  sourceData?: any;
  setColumnWidth?: (data: Record<string, any>) => void;
  [key: string]: any;
};

export function useTableDesigner(props: tableDesignerInstance) {
  const { setColumns, getColumnsRender, type = 'table' } = props;
  const { setInitialState } = useModel('@@initialState');
  const { json = {}, setJson } = useContext(DevJsonContext); //读取本地化的配置信息
  const config: Record<string, Record<string, string>> = {
    form: {
      deleteUrl: 'dev/menu/deleteFormColumn',
      editUrl: 'dev/menu/editFormColumn',
      sortUrl: 'dev/menu/sortFormColumns',
    },
    tab: {
      sortUrl: 'dev/menu/sortFormColumns',
    },
    formGroup: {
      sortUrl: 'dev/menu/sortFormColumns',
    },
    table: {
      editUrl: 'dev/menu/editTableColumn',
      deleteUrl: 'dev/menu/deleteTableColumn',
      sortUrl: 'dev/menu/sortTableColumns',
      setWidthUrl: 'dev/menu/setTableColumnWidth',
    },
    toolbar: {
      sortUrl: 'dev/menu/sortTableColumns',
    },
    panel: {
      editUrl: 'dev/menu/editPanelColumn',
      deleteUrl: 'dev/menu/deletePanelColumn',
      sortUrl: 'dev/menu/sortPanelColumns',
      addUrl: 'dev/menu/addPanelRow',
    },
  };
  const editUrl = config[type].editUrl;
  const deleteUrl = config[type].deleteUrl;
  const addUrl = config[type].addUrl;
  const setWidthUrl = config[type].setWidthUrl;
  //const sortUrl = config[type].sortUrl;
  const reflush = (data: any) => {
    //重新设置列表列
    setColumns?.(getColumnsRender?.(data?.columns || [])); //设置这个可以快速响应 排序tab可能会卡一点
    //更新schema
    //pageMenu.schema = data.schema;
    //pageMenu.data = { ...pageMenu.data, ...data.data };
    if (data.currentUser) {
      setInitialState((s) => ({
        ...s,
        currentUser: { ...s?.currentUser, ...data.currentUser },
      }));
    }
  };
  const post = async (url: string, data: Record<string, any>) => {
    //后台请求
    const ret = await request.post(url, {
      data: { ...data, ...json },
      msgcls: ({ data: idata }: { data: any }) => {
        reflush(idata);
      },
    });
    return ret;
  };
  return {
    ...props,
    editUrl,
    deleteUrl,
    addUrl,
    reflush,
    sort: (id: number, columns: any, itype: 'table' | 'form' | 'toolbar' | 'tab') => {
      //后台请求
      //setColumns(getColumnsRender(columns));
      const url = config[itype].sortUrl;
      post(url, { columns, id }).then(({ code, data }) => {
        if (!code) {
          setJson?.(data?.data);
        }
      });
      return;
    },
    edit: async (data: Record<string, any>) => {
      //后台请求
      await post(editUrl, data);
      return;
    },
    add: async (data: Record<string, any>) => {
      //后台请求
      await post(addUrl, data);
      return;
    },
    setColumnWidth: async (data: Record<string, any>) => {
      //后台请求
      await post(setWidthUrl, data);
      return;
    },
  };
}

interface SchemaSettingsContextProps {
  setVisible?: any;
  visible?: any;
  [key: string]: any;
}

export const SchemaSettingsContext = createContext<SchemaSettingsContextProps>({});

export function useSchemaSettings() {
  return useContext(SchemaSettingsContext) as SchemaSettingsContextProps;
}

interface SchemaSettingsProviderProps {
  setVisible?: any;
  visible?: any;
  children?: ReactNode;
}

export const SchemaSettingsProvider: React.FC<SchemaSettingsProviderProps> = (props) => {
  const { children, ...others } = props;
  return (
    <SchemaSettingsContext.Provider value={{ ...others }}>
      {children}
    </SchemaSettingsContext.Provider>
  );
};

export interface SchemaSettingsProps {
  title?: any;
  children?: ReactNode;
  items?: GetProp<DropdownProps, 'menu'>['items'];
}

export const SchemaSettingsDropdown: React.FC<SchemaSettingsProps> = (props) => {
  const { title, items, ...others } = props;
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  const changeMenu: DropdownProps['onOpenChange'] = (nextOpen: boolean, info) => {
    // 在 antd v5.8.6 版本中，点击菜单项不会触发菜单关闭，但是升级到 v5.12.2 后会触发关闭。查阅文档发现
    // 在 v5.11.0 版本中增加了一个 info.source，可以通过这个来判断一下，如果是点击的是菜单项就不关闭菜单，
    // 这样就可以和之前的行为保持一致了。
    // 下面是模仿官方文档示例做的修改：https://ant.design/components/dropdown-cn
    //console.log('info', info, nextOpen);
    if (info.source === 'trigger' || nextOpen) {
      // 当鼠标快速滑过时，终止菜单的渲染，防止卡顿
      startTransition(() => {
        setVisible(nextOpen);
      });
    }
  };

  return (
    <SchemaSettingsProvider visible={visible} setVisible={setVisible} {...others}>
      <Dropdown
        open={visible}
        onOpenChange={changeMenu}
        trigger={['contextMenu']}
        // overlayClassName={css`
        //   .ant-dropdown-menu-item-group-list {
        //     max-height: 300px;
        //     overflow-y: auto;
        //   }
        // `}
        menu={{ items }}
      >
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {typeof title === 'string' ? <span>{title}</span> : title}
        </span>
        {/* {typeof title === 'string' ? <span>{title}</span> : title} */}
      </Dropdown>
    </SchemaSettingsProvider>
  );
};
