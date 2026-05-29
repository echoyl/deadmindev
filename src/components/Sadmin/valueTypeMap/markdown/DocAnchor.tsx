import { Anchor, GetProp } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import React from 'react';
import { pageTopHeight } from '../../helper/functions';
const headerHeight = pageTopHeight();
export const useStyle = createStyles(({ cssVar, token, css }) => {
  const { antCls } = token;
  return {
    anchorToc: css`
      scrollbar-width: thin;
      scrollbar-gutter: stable;
      ${antCls}-anchor {
        ${antCls}-anchor-link-title {
          font-size: ${cssVar.fontSizeSM};
        }
      }
    `,
    tocWrapper: css`
      position: fixed;
      top: calc(${headerHeight}px + ${cssVar.marginXL} - 21px);
      inset-inline-end: 0;
      width: 160px;
      padding: 0;
      border-radius: ${cssVar.borderRadius};
      box-sizing: border-box;
      margin-inline-end: calc(8px - 100vw + 100%);
      //z-index: 10;
      .toc-debug {
        color: ${cssVar.purple6};
        &:hover {
          color: ${cssVar.purple5};
        }
      }
      > div {
        box-sizing: border-box;
        width: 100%;
        max-height: calc(100vh - ${headerHeight}px - 27px) !important;
        margin: auto;
        padding: ${cssVar.paddingXXS};
        overflow: auto;
        backdrop-filter: blur(8px);
      }

      @media only screen and (max-width: ${cssVar.screenLG}) {
        display: none;
      }
    `,
    articleWrapper: css`
      padding-inline: 48px 164px;
      padding-block: 0 32px;

      @media only screen and (max-width: ${cssVar.screenLG}) {
        & {
          padding: 0 calc(${cssVar.paddingLG} * 2);
        }
      }
    `,
  };
});

interface DocAnchorProps {
  showDebug?: boolean;
  debugDemos?: string[];
  anchors?: GetProp<typeof Anchor, 'items'>;
}

interface AnchorItem {
  id: string;
  title: string;
  children?: AnchorItem[];
}

const DocAnchor: React.FC<DocAnchorProps> = ({ anchors = [] }) => {
  const { styles } = useStyle();
  const token = useTheme();

  return (
    <section className={styles.tocWrapper}>
      <Anchor
        affix={false}
        className={styles.anchorToc}
        targetOffset={headerHeight}
        showInkInFixed
        items={anchors}
      />
    </section>
  );
};

export default DocAnchor;
