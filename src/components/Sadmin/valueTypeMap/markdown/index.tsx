import type { ComponentProps } from '@ant-design/x-markdown';
import XMarkdown from '@ant-design/x-markdown';
import { Link } from '@umijs/max';
import { Typography } from 'antd';
import { omit } from 'es-toolkit';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import React, { useContext, useEffect } from 'react';
import { isHttpLink } from '../../checkers';
import { SaDevContext } from '../../dev';
import './Welcome-dark.css';
import './Welcome.css';
const Code: React.FC<ComponentProps> = (props) => {
  const { className, children, block } = props;
  const langString = className?.match(/language-(\w+)/)?.[1] || '';
  if (typeof children !== 'string') return children;
  // if (lang === 'mermaid') {
  //   return <Mermaid>{children}</Mermaid>;
  // }
  // if (lang === 'infographic') {
  //   return <ReactInfographic>{children}</ReactInfographic>;
  // }
  const classnames = ['hljs'];
  if (langString) {
    classnames.push(`language-${langString}`);
  }
  const text = children;
  let highlighted: string;
  if (langString && hljs.getLanguage(langString)) {
    highlighted = hljs.highlight(text.replace(/\n$/, ''), {
      language: langString,
    }).value;
  } else {
    highlighted = block ? hljs.highlightAuto(text.replace(/\n$/, '')).value : text;
  }
  const code = (
    <code className={classnames.join(' ')} dangerouslySetInnerHTML={{ __html: highlighted }} />
  );
  if (!block) {
    return code;
  }
  const copy = (
    <Typography.Paragraph
      copyable={{ text }}
      style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
    />
  );
  return (
    <div style={{ position: 'relative' }}>
      {copy}
      {code}
    </div>
  );
};

// XMarkdown Renderer passes class names via non-standard props
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  tag?: string;
  domNode?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classname?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class?: any;
}

const Heading: React.FC<HeadingProps> = ({
  tag: Tag = 'h1',
  children,
  className,
  classname,
  class: htmlClass,
}) => {
  // Merge all possible class sources from XMarkdown Renderer
  const allClasses = [className, classname, htmlClass].filter(Boolean).join(' ');
  // Extract text content from children for id generation
  const textContent = React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : ''))
    .join('');
  const id = textContent
    .replace(/[^\w\s一-鿿-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  const mergedClass = `heading-anchor ${allClasses}`.trim();
  return (
    // @ts-expect-error dynamic tag
    <Tag id={id} className={mergedClass}>
      <a href={`#${id}`} className="anchor-link">
        #
      </a>
      {children}
    </Tag>
  );
};
const getPropsClassname = (props: any) => {
  const { className, classname, class: htmlClass } = props;
  const restProps = omit(props, ['streamStatus', 'domNode', 'children', 'className']);
  const allClasses = [className, classname, htmlClass].filter(Boolean);
  const classes = allClasses.length > 0 ? allClasses.join(' ') : '';
  if (classes) {
    restProps.className = classes;
  }
  return restProps;
};
const mdComponents = {
  h1: (props: HeadingProps) => <Heading tag="h1" {...props} />,
  h2: (props: HeadingProps) => <Heading tag="h2" {...props} />,
  h3: (props: HeadingProps) => <Heading tag="h3" {...props} />,
  h4: (props: HeadingProps) => <Heading tag="h4" {...props} />,
  code: Code,
  a: (props: any) => {
    //普通锚点需要添加一个id属性，然后antd的锚点组件可以根据这个id属性来定位
    const { children } = props;
    const restProps = getPropsClassname(props);
    if (typeof children === 'string') {
      //如果href存在 antadmin 则使用link组件本地跳转
      if (!isHttpLink(restProps.href) && restProps.href?.indexOf('/antadmin/') > -1) {
        //将href的 /antadmin/ 替换为空
        const linkto = restProps.href?.replace('/antadmin/', '');
        return <Link to={linkto}>{children}</Link>;
      } else {
        //如果href第一个字符是 #跳转锚点 去掉target=blank
        if (restProps.href?.startsWith('#')) {
          return (
            <a href={restProps.href} title={children}>
              {children}
            </a>
          );
        }

        return <a {...restProps}>{children}</a>;
      }
    }
    if (restProps.name) {
      return <span id={restProps.name} {...restProps} />;
    } else {
      return <a {...restProps}>{children}</a>;
    }
  },
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const parseTabGroups = (content: string) => {
  if (!content) return content;

  const fenceRe = /```([^\n]*)\n([\s\S]*?)```/g;
  const matches: {
    start: number;
    end: number;
    raw: string;
    info: string;
    code: string;
  }[] = [];

  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(content)) !== null) {
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      raw: m[0],
      info: (m[1] || '').trim(),
      code: m[2] || '',
    });
  }
  if (matches.length === 0) return content;

  let out = '';
  let cursor = 0;

  const tabNameFromInfo = (info: string) => {
    const tabMatch = info.match(/tab\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s]+))/i);
    if (tabMatch) return tabMatch[1] || tabMatch[2] || tabMatch[3];
    return null;
  };

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    // if this match is already consumed by previous grouping, skip
    if (cursor > cur.start) continue;

    const curTab = tabNameFromInfo(cur.info);
    if (!curTab) {
      // not a tab-coded block, copy up to it and the block itself
      out += content.slice(cursor, cur.end);
      cursor = cur.end;
      continue;
    }

    // collect consecutive matches where info has tab= and separated only by whitespace/newlines
    const group = [cur];
    let j = i + 1;
    while (j < matches.length) {
      const next = matches[j];
      const between = content.slice(group[group.length - 1].end, next.start);
      if (/\S/.test(between)) break; // non-whitespace between blocks -> stop grouping
      const nextTab = tabNameFromInfo(next.info);
      if (!nextTab) break;
      group.push(next);
      j++;
    }

    if (group.length === 1) {
      // single tab block -> no grouping, just copy raw
      // out += content.slice(cursor, cur.end);
      // cursor = cur.end;
      // continue;
    }

    // group length >=2 -> replace the whole group with tab html
    const groupStart = group[0].start;
    const groupEnd = group[group.length - 1].end;
    out += content.slice(cursor, groupStart);

    // build tab headers and panels
    const headers: string[] = [];
    const panels: string[] = [];
    for (let k = 0; k < group.length; k++) {
      const block = group[k];
      const infoParts = (block.info || '').split(/\s+/).filter(Boolean);
      let lang = '';
      if (infoParts.length > 0 && !/=/.test(infoParts[0])) lang = infoParts[0];
      const tabName = tabNameFromInfo(block.info) || lang || `tab${k + 1}`;
      const slug = tabName
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim()
        .replace(/\s+/g, '-');

      headers.push(
        `<button type="button" data-tab="${slug}" class="md-tab-header${
          k === 0 ? ' active' : ''
        }">${escapeHtml(tabName)}</button>`,
      );

      //代码块插入到面板中 之后会使用code组件自动解析
      panels.push(
        `<div class="md-tab-panel${k === 0 ? ' active' : ''}" data-tab="${slug}">\n\n${
          block.raw
        }\n\n</div>`,
      );
    }

    const groupHtml = `<div class="md-code-tabs">
      <div class="md-tab-headers">${headers.join('')}</div>
      <div class="md-tab-panels">${panels.join('')}</div>
    </div>`;
    out += groupHtml;
    cursor = groupEnd;
    // advance i to j-1 so loop continues after group
    i = j - 1;
  }

  // append remainder
  out += content.slice(cursor);
  return out;
};

const Markdown = (props: any) => {
  const { setting } = useContext(SaDevContext);

  // attach click handler to toggle tabs
  useEffect(() => {
    const container = document.querySelector('.welcome-markdown');
    if (!container) return;
    const onClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const headerBtn = target.closest('.md-tab-header') as HTMLElement;
      if (!headerBtn) return;
      const tabs = headerBtn.closest('.md-code-tabs') as HTMLElement;
      if (!tabs) return;
      const tab = headerBtn.getAttribute('data-tab');
      if (!tab) return;
      // toggle active header
      tabs.querySelectorAll('.md-tab-header').forEach((el) => el.classList.remove('active'));
      headerBtn.classList.add('active');
      // show corresponding panel
      tabs.querySelectorAll<HTMLElement>('.md-tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-tab') === tab);
      });
    };
    container.addEventListener('click', onClick);
    return () => container.removeEventListener('click', onClick);
  }, []);

  const children =
    typeof props.children === 'string' ? parseTabGroups(props.children) : props.children;

  return (
    <div data-theme={setting?.navTheme != 'light' ? 'dark' : 'light'} style={props?.style}>
      <div className="welcome-markdown">
        <XMarkdown
          components={mdComponents}
          paragraphTag={props?.paragraphTag || 'p'}
          openLinksInNewTab={true}
        >
          {children}
        </XMarkdown>
      </div>
    </div>
  );
};
export default Markdown;
