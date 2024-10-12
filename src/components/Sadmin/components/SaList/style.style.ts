import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    card: {
      width: '100%',
      cursor: 'pointer',
      borderColor: '#f0f0f0',
      borderRadius: '8px',
      overflow: 'inherit',
      '.ant-pro-checkcard-cover': {
        marginTop: '-1px',
        marginInlineStart: '-1px',
        marginInlineEnd: '-1px',
      },
      // '&:hover .ant-pro-checkcard-cover': {
      //   marginTop: '-1px',
      //   marginInlineStart: '0px',
      //   marginInlineEnd: '0px',
      // },
      '.ant-card-meta-title': {
        marginBottom: '8px',
        color: 'rgba(0, 0, 0, 0.88)',
        fontWeight: 600,
        fontSize: '16px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        '& > a': {
          display: 'inline-block',
          maxWidth: '100%',
          color: token.colorTextHeading,
        },
      },
      '& .ant-pro-checkcard-cover': {
        padding: 0,
      },
      '.ant-card-meta-description': {
        height: '44px',
        overflow: 'hidden',
        lineHeight: '22px',
      },
      '&:hover,&.ant-pro-checkcard-checked': {
        borderColor: 'transparent !important',
        boxShadow:
          '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
        '.ant-card-meta-title > a': {
          color: token.colorPrimary,
        },
      },
      '& img.card_cover_image': {
        objectFit: 'cover',
        display: 'block',
        width: '100%',
        borderRadius: '8px 8px 0 0',
      },
    },
    cardItemContent: {
      display: 'flex',
      height: '20px',
      marginTop: '16px',
      marginBottom: '-4px',
      lineHeight: '20px',
      '& div:first-child .card_item_content_item,> div.card_item_content_item:first-child ': {
        color: token.colorTextSecondary,
        fontSize: '12px',
      },
    },
    avatarList: {
      flex: '0 1 auto',
    },
    cardList: {
      marginTop: '24px',
    },
    coverCardList: {
      '.ant-list .ant-list-item-content-single': { maxWidth: '100%' },
    },
  };
});

export default useStyles;
