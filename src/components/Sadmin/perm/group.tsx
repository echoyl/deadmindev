import request from '@/components/Sadmin/lib/request';
import { TreeSelect } from 'antd';
import { DataNode } from 'antd/es/tree';
import React, { useContext, useEffect, useState } from 'react';
import { SaContext } from '../posts/table';
import { loopMenuLocale } from '../helpers';

const PermGroup: React.FC<{
  onChange?: (value: any) => void;
  roleList?: string[] | boolean;
  roleid?: number;
  role_id?: number;
  value?: any;
  url?: string;
}> = (props) => {
  const {
    value: ivalue,
    roleid = 0,
    role_id = 0,
    onChange: onValueChange,
    url = 'perm/role/perms',
  } = props;
  const [perms, setPerms] = useState<DataNode[]>();
  const [value, setValue] = useState<string[]>([]);
  const { formRef } = useContext(SaContext);
  const [init, setInit] = useState(false);

  const getData = async (roleid: number) => {
    const { data, code } = await request.get(url, { params: { roleid } });
    if (code) {
      return;
    }
    setPerms(loopMenuLocale(data.perms || [], { children: 'options' }));
    //console.log('get data ivalue is', ivalue, init);
    if (!init) {
      setInit(true);
      setValue(ivalue ? ivalue.split(',') : []);
    } else {
      //console.log('set roleid s perms',roleid,data.role_perms2);
      if (roleid && data.role_perms2) {
        setValue(data.role_perms2);
        formRef.current?.setFieldValue('perms2', data.role_perms2?.join(','));
      }
    }

    // setRolePerms(data.role_perms);
    // //console.log('get data roleid is', rid);
    // if (rid) {
    //   //console.log('has init roleid', rid, data.role_perms[rid]);
    //   setRoleList(data.role_perms[rid]);
    // }
  };

  useEffect(() => {
    if (formRef.current) {
      getData(roleid ? roleid : role_id);
    }
  }, [formRef, roleid, role_id]);

  const onChange = (newValue: string[]) => {
    //console.log('onChange ', newValue);
    setValue(newValue);
    onValueChange?.(newValue.join(','));
  };

  const tProps = {
    treeData: perms,
    value,
    fieldNames: { label: 'label', value: 'value', children: 'options' },
    onChange,
    treeCheckable: true,
    //showCheckedStrategy: SHOW_PARENT,
    placeholder: '请勾选权限设置',
    style: {
      width: '100%',
    },
    maxTagCount: 5,
    allowClear: true,
  };

  return (
    <TreeSelect
      {...tProps}
      // treeTitleRender={(item) => {
      //   //console.log('item', item);
      //   return item.label ? tplComplie(item.label) : item.label;
      // }}
    />
  );
};
export default PermGroup;
