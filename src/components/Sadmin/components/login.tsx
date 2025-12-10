import { saGetSetting } from '@/components/Sadmin/components/refresh';
import { useAdminStore } from '@/components/Sadmin/dev/context';
import { Login } from '@/pages/login';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';

const LoginModal = () => {
  const [setting, setSetting] = useState<any>();
  useEffect(() => {
    saGetSetting().then((v) => {
      setSetting(v);
    });
  }, []);
  const { showLogin = false } = useAdminStore();
  return (
    <>
      <Modal
        open={showLogin}
        footer={null}
        title={null}
        closable={false}
        width={380}
        destroyOnHidden={true}
        //styles={{ content: { background: 'none', boxShadow: 'none' } }}
      >
        <Login setting={setting} type="modal" />
      </Modal>
    </>
  );
};

export default LoginModal;
