import { Anchor, GetProp } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import React from 'react';
import { pageTopHeight } from '../../helper/functions';
const headerHeight = pageTopHeight();

/**
 * 获取 markdown 内容中的锚点信息
 * @param content markdown 内容
 * @param maxLevel 获取的最大层级
 * @returns
 */
export const getAnchors = (markdownContent: string, maxLevel = 3) => {
  if (!markdownContent) return [];

  //需要先将content中的代码块标签去除后再开始匹配
  const codeBlockRegex = /^```[^\n]*\n[\s\S]*?\n^```/gm;
  const content = markdownContent.replace(codeBlockRegex, '');

  const headingRe = /^(\#{1,6})\s{1}(.+)$/gm;
  const headings: { level: number; title: string; slug: string; href: string }[] = [];
  const slugCounts: Record<string, number> = {};
  let m: RegExpExecArray | null;

  const normalizeTitle = (raw: string) =>
    raw
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/`(.+?)`/g, '')
      .replace(/[*_~]/g, '')
      .trim();

  const findPreviousNonEmptyLine = (idx: number) => {
    // 找出当前位置之前最近的非空行文本
    const before = content.slice(0, idx);
    const lines = before.split(/\r?\n/);
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line) return line;
    }
    return '';
  };

  const extractAnchorName = (line: string) => {
    // 匹配 <a ... name="xxx" ...> 或 name='xxx'
    const nameMatch = line.match(/<a\b[^>]*\bname\s*=\s*['"]([^'"]+)['"][^>]*>/i);
    if (nameMatch && nameMatch[1]) return nameMatch[1];
    // 兼容 id 属性或 id/name 混用的情况
    const idMatch = line.match(/<a\b[^>]*\bid\s*=\s*['"]([^'"]+)['"][^>]*>/i);
    if (idMatch && idMatch[1]) return idMatch[1];
    return null;
  };

  while ((m = headingRe.exec(content)) !== null) {
    const hashes = m[1];
    const level = hashes.length;
    if (level > maxLevel) continue;
    const raw = m[2].trim();
    const title = normalizeTitle(raw) || 'heading';

    // 先尝试从上一行的 <a name="..."> 中获取锚点
    const prevLine = findPreviousNonEmptyLine(m.index);
    const anchorName = extractAnchorName(prevLine);

    let base = '';
    if (anchorName) {
      base = String(anchorName)
        .toLowerCase()
        .replace(/^\s*#/, '')
        //.replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    } else {
      base = title
        .toLowerCase()
        //.replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s&\s/g, '-')
        .replace(/\s+/g, '-');
    }

    let slug = base || 'heading';
    if (slugCounts[slug] && !anchorName) {
      //如果没有a标签锚点则需要增加slug的计数
      slugCounts[slug] += 1;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
    }

    headings.push({ level, title, slug, href: `#${slug}` });
  }

  // 构建层级树
  const root: any[] = [];
  const stack: any[] = [];

  for (const h of headings) {
    const node = { key: h.slug, href: h.href, title: h.title, children: [] };
    const lvl = h.level;

    if (lvl === 1) {
      root.push(node);
      stack[1] = node;
      for (let i = 2; i <= 6; i++) stack[i] = undefined;
    } else {
      let parent: any | undefined;
      for (let l = lvl - 1; l >= 1; l--) {
        if (stack[l]) {
          parent = stack[l];
          break;
        }
      }
      if (parent) {
        parent.children.push(node);
      } else {
        root.push(node);
      }
      stack[lvl] = node;
      for (let i = lvl + 1; i <= 6; i++) stack[i] = undefined;
    }
  }

  return root;
};

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
