import { Mermaid } from '@ant-design/x';
import XMarkdown, { type ComponentProps } from '@ant-design/x-markdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import React, { useContext } from 'react';
import { SaDevContext } from '../../dev';
import ReactInfographic from './ReactInfographic';
import './Welcome-dark.css';
import './Welcome.css';
const Code: React.FC<ComponentProps> = (props) => {
  const { className, children } = props;
  const lang = className?.match(/language-(\w+)/)?.[1] || '';
  if (typeof children !== 'string') return children;
  if (lang === 'mermaid') {
    return <Mermaid>{children}</Mermaid>;
  }
  if (lang === 'infographic') {
    return <ReactInfographic>{children}</ReactInfographic>;
  }
  return children;
};
const mdConfig = {
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const langString = (lang || '').trim();
      if (lang == 'mermaid' || lang == 'infographic') {
        return `<code class="language-${langString}">${text}</code>\n`;
      }
      let highlighted: string;
      if (langString && hljs.getLanguage(langString)) {
        highlighted = hljs.highlight(text.replace(/\n$/, ''), {
          language: langString,
        }).value;
      } else {
        highlighted = hljs.highlightAuto(text.replace(/\n$/, '')).value;
      }
      const classAttr = langString ? ` class="hljs language-${langString}"` : ' class="hljs"';
      return `<pre><code${classAttr}>${highlighted}\n</code></pre>\n`;
    },
  },
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
const mdComponents = {
  h1: (props: HeadingProps) => <Heading tag="h1" {...props} />,
  h2: (props: HeadingProps) => <Heading tag="h2" {...props} />,
  h3: (props: HeadingProps) => <Heading tag="h3" {...props} />,
  h4: (props: HeadingProps) => <Heading tag="h4" {...props} />,
  code: Code,
};

const Markdown = (props: any) => {
  const { setting } = useContext(SaDevContext);
  return (
    <div data-theme={setting?.navTheme != 'light' ? 'dark' : 'light'}>
      <div className="welcome-markdown">
        <XMarkdown components={mdComponents} config={mdConfig} paragraphTag="div">
          {props.children}
        </XMarkdown>
      </div>
    </div>
  );
};
export default Markdown;
