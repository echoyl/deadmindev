import { useModel } from '@umijs/max';
import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ token, css }) => ({
  footer: css`
    padding: 0 24px 16px;
    text-align: center;
    color: ${token.colorTextDescription};
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeight};
    background: transparent;
  `,
  copyright: css`
    height: 22px;
    line-height: 22px;
  `,
}));

const Footer: React.FC = () => {
  const { styles } = useStyles();
  const year = new Date().getFullYear();
  const { initialState } = useModel('@@initialState');
  const techContent = initialState?.settings?.adminSetting?.tech;

  return (
    <div className={styles.footer}>
      <div className={styles.copyright}>
        <span dangerouslySetInnerHTML={{ __html: techContent }}></span> &copy; {year}
      </div>
    </div>
  );
};

export default Footer;
