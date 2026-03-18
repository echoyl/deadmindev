import { DefaultFooter } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { theme } from 'antd';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { initialState } = useModel('@@initialState');
  const techContent = initialState?.settings?.adminSetting?.tech;
  const tech = techContent ? `${currentYear} ${techContent}` : '';
  const { token } = theme.useToken();
  return !tech ? null : (
    <>
      <DefaultFooter
        style={{
          background: 'none',
          color: token.colorTextBase,
        }}
        copyright={<span dangerouslySetInnerHTML={{ __html: tech }}></span>}
        //copyright={<a href="#">test</a>}
        // links={[
        //   {
        //     key: 'Ant Design Pro',
        //     title: 'Ant Design Pro',
        //     href: 'https://pro.ant.design',
        //     blankTarget: true,
        //   },
        //   {
        //     key: 'github',
        //     title: <GithubOutlined />,
        //     href: 'https://github.com/ant-design/ant-design-pro',
        //     blankTarget: true,
        //   },
        //   {
        //     key: 'Ant Design',
        //     title: 'Ant Design',
        //     href: 'https://ant.design',
        //     blankTarget: true,
        //   },
        // ]}
      />
    </>
  );
};

export default Footer;
