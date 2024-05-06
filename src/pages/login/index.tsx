import CaptchaInput from '@/components/CaptchInput';
import Footer from '@/components/Footer';
import ButtonModal from '@/components/Sadmin/action/buttonModal';
import { WebSocketContext } from '@/components/Sadmin/hooks/websocket';
import { message, notification } from '@/components/Sadmin/message';
import { saGetSetting } from '@/components/Sadmin/refresh';
import request, { adminTokenName } from '@/services/ant-design-pro/sadmin';
import { LockOutlined, UserOutlined, WechatOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import {
  LoginForm,
  ProForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDependency,
  ProFormInstance,
  ProFormText,
  setAlpha,
} from '@ant-design/pro-components';
import { Helmet, history, useModel, useSearchParams } from '@umijs/max';
import { Tabs, QRCode, Space, theme, GetProp } from 'antd';
import React, { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import styles from './index.less';

const LoginComponent: React.FC = () => {
  return <Login />;
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [captchaReload, setCaptchaReload] = useState(0);
  const [captchaPhoneReload, setCaptchaPhoneReload] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const [isQrcode, setIsQrcode] = useState(false);

  const [searchParams] = useSearchParams();

  const { clientId, messageData, bind } = useContext(WebSocketContext);
  const [setting, setSetting] = useState<any>();
  const [loginType, setLoginType] = useState();
  useEffect(() => {
    saGetSetting().then((v) => {
      //console.log('setSetting', v);
      setSetting(v);
      setLoginType(v?.loginTypeDefault);
    });
  }, []);

  const doLogin = (data) => {
    localStorage.setItem(adminTokenName, data.access_token);
    //await fetchUserInfo();
    bind?.();
    setInitialState((s) => ({
      ...s,
      currentUser: data.userinfo,
      settings: { ...s?.settings, ...data.setting },
    })).then(() => {
      //const redirect = searchParams.get('redirect') || '/';
      const redirect = '/';
      let goUrl = '/';
      if (data.userinfo.redirect) {
        //后台登录后指定跳转页面
        goUrl = data.userinfo.redirect;
      } else if (initialState?.settings?.baseurl) {
        goUrl = redirect.replace(initialState?.settings?.baseurl, '/');
      }
      //console.log('goUrl is ', goUrl);
      history.push(goUrl);
    });
  };

  useEffect(() => {
    //console.log('messageData', messageData);
    if (!messageData) {
      return;
    }
    const { data } = messageData;
    if (data?.action == 'login') {
      //如果是登录的话 跳转登录
      localStorage.setItem('Sa-Remember', '1');
      message.success({
        content: data.msg,
        duration: 1,
        onClose: () => {
          flushSync(() => {
            doLogin(data);
          });
        },
      });
    }
  }, [messageData]);

  //console.log('clientId', clientId, initialState?.settings);

  //console.log('redirect', searchParams.get('redirect'));

  const handleSubmit = async (values: API.LoginParams) => {
    // 登录
    await request.post('login', {
      data: { ...values, loginType },
      duration: 1,
      then: (res) => {
        const { code, msg, data } = res;
        if (res.code) {
          notification.error({ description: msg, message: '提示' });
          if (loginType == 'phone' && res.code == 3) {
            setCaptchaPhoneReload(captchaReload + 1);
          }
          if (showCaptcha) {
            setCaptchaReload(captchaReload + 1);
          }
          if (res.code == 3 || res.code == 2) {
            //需要输入图形验证码了
            setShowCaptcha(true);
          }
        } else {
          if (values.autoLogin) {
            localStorage.setItem('Sa-Remember', '1');
          } else {
            localStorage.setItem('Sa-Remember', '0');
          }
          message.success({
            content: msg,
            duration: 1,
            onClose: () => {
              flushSync(() => {
                doLogin(res.data);
              });
            },
          });
        }
      },
    });
    return;
  };

  const containerStyle: CSSProperties = {};

  if (setting?.loginBgImgage) {
    containerStyle.backgroundImage = 'url("' + setting.loginBgImgage + '")';
  }
  const formRef = useRef<ProFormInstance>();

  const loginTypeItems = [
    {
      label: '手机号登录',
      key: 'phone',
      children:
        loginType != 'phone' ? null : (
          <>
            <ProFormText
              name="mobile"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder="请输入手机号码"
              rules={[
                {
                  required: true,
                  message: '请输入手机号！',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '手机号格式错误！',
                },
              ]}
            />
            <ProForm.Item
              name="captchaPhone"
              rules={[
                {
                  required: true,
                  message: '获取手机验证码请输入图形验证码',
                },
              ]}
            >
              <CaptchaInput
                reload={captchaPhoneReload}
                placeholder="获取手机验证码请输入图形验证码"
              />
            </ProForm.Item>
            <ProFormDependency name={['captchaPhone']}>
              {({ captchaPhone }) => {
                return (
                  <ProFormCaptcha
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined />,
                    }}
                    countDown={60}
                    captchaProps={{
                      size: 'large',
                    }}
                    phoneName="mobile"
                    placeholder="请输入验证码"
                    captchaTextRender={(timing, count) => {
                      if (timing) {
                        return `${count} 获取验证码`;
                      }
                      return '获取验证码';
                    }}
                    name="mobilecode"
                    rules={[
                      {
                        required: true,
                        message: '请输入验证码！',
                      },
                    ]}
                    onGetCaptcha={async (phone) => {
                      try {
                        await formRef.current?.validateFields(['captcha']);
                      } catch (errorInfo) {
                        //setConfirmLoading(false);
                        throw new Error('表单验证失败');
                      }
                      const { code, msg } = await request.post('sms', {
                        data: { mobile: phone, captcha: captchaPhone },
                      });
                      if (code) {
                        throw new Error(msg);
                      }
                    }}
                  />
                );
              }}
            </ProFormDependency>
            {showCaptcha && (
              <ProForm.Item
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入图形验证码',
                  },
                ]}
              >
                <CaptchaInput reload={captchaReload} />
              </ProForm.Item>
            )}
          </>
        ),
    },
    {
      label: '账号密码登录',
      key: 'password',
      children:
        loginType != 'password' ? null : (
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder="请输入账号名称"
              rules={[
                {
                  required: true,
                  message: '请输入用户名!',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              placeholder="请输入登录密码"
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
            {showCaptcha && (
              <ProForm.Item
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入图形验证码',
                  },
                ]}
              >
                <CaptchaInput reload={captchaReload} />
              </ProForm.Item>
            )}
          </>
        ),
    },
  ];
  const { token } = theme.useToken();
  const iconStyles: CSSProperties = {
    marginInlineStart: '16px',
    color: setAlpha(token.colorTextBase, 0.2),
    fontSize: '24px',
    verticalAlign: 'middle',
    cursor: 'pointer',
  };
  const ActionLogin = (props) => {
    const { type } = props;
    const [timestamp, setTimestamp] = useState<number>(0);
    const [status, setStatus] = useState<GetProp<typeof QRCode, 'status'>>('active');
    const expiredTimes = 3 * 60; //3分钟后过期
    let tout: string | number | undefined | NodeJS.Timeout;
    const clock = (timestamp: number) => {
      const now = Date.now();
      // console.log(
      //   'timeis now',
      //   now,
      //   timestamp + expiredTimes * 1000,
      //   now > timestamp + expiredTimes * 1000,
      // );
      if (now > timestamp + expiredTimes * 1000) {
        //过期了
        //setTimestamp(now);
        setStatus('expired');
        //tout = setTimeout(() => clock(now), 1000);
      } else {
        tout = setTimeout(() => clock(timestamp), 1000);
      }
    };
    const refresh = () => {
      const now = Date.now();
      setTimestamp(now);
      setStatus('active');
      tout = setTimeout(() => clock(now), 1000);
    };
    useEffect(() => {
      const tm = Date.now();
      setTimestamp(tm);
      tout = setTimeout(() => clock(tm), 1000);
      return () => clearTimeout(tout);
    }, []);

    if (type == 'wechat') {
      const { url, desc } = setting?.loginWechat;
      const qrcodeUrl = url + '?client_id=' + clientId + '&timestamp=' + timestamp;
      console.log('qrcodeUrl', qrcodeUrl);
      return (
        <div style={{ textAlign: 'center' }}>
          {timestamp ? (
            <QRCode
              style={{ margin: '0 auto' }}
              value={qrcodeUrl}
              status={status}
              onRefresh={refresh}
            />
          ) : null}
          <div style={{ marginTop: 20 }}>{desc}</div>
        </div>
      );
    }
    return null;
  };
  return setting ? (
    <div className={styles.container} style={{ ...containerStyle }}>
      <Helmet>
        <title>登录 - {setting?.title}</title>
      </Helmet>
      <div className={styles.content} style={containerStyle.backgroundImage ? {} : { padding: 0 }}>
        <ProCard
          style={{
            //maxWidth: 440,
            margin: '0px auto',
            padding: '20px 0',
            background: containerStyle.backgroundImage ? '#fff' : 'none',
          }}
        >
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '75vw',
            }}
            containerStyle={{
              paddingInline: 0,
            }}
            formRef={formRef}
            logo={setting?.logo}
            title={setting?.title}
            subTitle={
              setting?.subtitle ? (
                <span dangerouslySetInnerHTML={{ __html: setting?.subtitle }}></span>
              ) : null
            }
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.LoginParams);
            }}
            //submitter={isQrcode ? false : undefined}
            actions={
              setting?.loginActions ? (
                <Space>
                  其他登录方式
                  <ButtonModal
                    trigger={<WechatOutlined style={iconStyles} />}
                    width={350}
                    title="扫码登录"
                  >
                    {setting?.loginActions?.map((ac, index) => {
                      return <ActionLogin key={index} type={ac} />;
                    })}
                  </ButtonModal>
                </Space>
              ) : null
            }
          >
            <Tabs
              centered
              activeKey={loginType}
              onChange={(activeKey) => {
                setLoginType(activeKey);
                setIsQrcode(activeKey == 'phone');
              }}
              items={setting.loginType?.map((v) => {
                return loginTypeItems.find((item) => item.key == v);
              })}
            />
            {isQrcode ? null : (
              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <ProFormCheckbox noStyle name="autoLogin">
                  自动登录
                </ProFormCheckbox>
                <a
                  style={{
                    float: 'right',
                  }}
                  onClick={() => {
                    message.info('请使用手机号登录后修改,或联系后台管理员修改账号密码！');
                  }}
                >
                  忘记密码
                </a>
              </div>
            )}
          </LoginForm>
        </ProCard>
      </div>

      <Footer />
    </div>
  ) : null;
};

export default LoginComponent;
