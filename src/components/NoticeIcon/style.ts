import type { GenerateStyle, ProAliasToken } from '@ant-design/pro-components';
import { useStyle as useAntdStyle } from '@ant-design/pro-components';

interface GlobalHeaderToken extends ProAliasToken {
  componentCls: string;
}

const genGlobalHeaderStyle: GenerateStyle<GlobalHeaderToken> = (token) => {
  return {
    [token.componentCls]: {
      '&-span': {
        cursor: 'pointer',
        padding: '12px !important',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        verticalAlign: 'middle',
        marginRight: -14, //没找到avatarProps的padding设置只能在bell里写一个负margin
      },

      '&-icon': {
        color: `${token.layout?.header?.colorTextRightActionsItem} !important`,
        padding: 1,
        verticalAlign: 'middle',
        fontSize: 16,
      },
    },
  };
};

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProLayoutGlobalHeaderx', (token) => {
    const GlobalHeaderToken: GlobalHeaderToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genGlobalHeaderStyle(GlobalHeaderToken)];
  });
}
