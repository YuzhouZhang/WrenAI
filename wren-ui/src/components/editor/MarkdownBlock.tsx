import { useEffect, useState, useId } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const reactId = useId();
  const uniqueId = `mermaid-${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(uniqueId, code);
        if (isMounted) {
          setSvg(svg);
          setError(false);
        }
      } catch (err) {
        console.error('Mermaid 渲染失败:', err);
        if (isMounted) setError(true);
        const errorNode = document.getElementById(uniqueId);
        if (errorNode) errorNode.remove();
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, uniqueId]);

  if (error || !svg) {
    return (
      <pre>
        <code className="language-mermaid">{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="mermaid-container my-4 flex justify-center overflow-x-auto bg-white p-4 rounded border border-gray-200"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const ReactMarkdownBlock = styled(ReactMarkdown)`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--gray-10);
    margin-bottom: 8px;
  }
  h1 {
    font-size: 20px;
  }
  h2 {
    font-size: 18px;
  }
  h3 {
    font-size: 16px;
  }
  h4 {
    font-size: 14px;
  }
  hr {
    border-top: 1px solid var(--gray-5);
    border-bottom: none;
    border-left: none;
    border-right: none;
    margin: 18px 0;
  }
  pre {
    background-color: var(--gray-2);
    border: 1px var(--gray-4) solid;
    padding: 16px;
    border-radius: 4px;
  }
  table td,
  table th {
    border: 1px solid var(--gray-4);
    padding: 4px 8px;
  }
  table th {
    background-color: var(--gray-2);
    font-weight: 600;
  }
  table {
    border: 1px solid var(--gray-4);
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  ol,
  ul,
  dl {
    padding-inline-start: 20px;
  }
  h1 code,
  h2 code,
  h3 code,
  h4 code,
  li code,
  p code {
    font-size: 12px;
    background: var(--gray-4);
    color: var(--gray-8);
    padding: 2px 4px;
    border-radius: 4px;
  }
`;

export default function MarkdownBlock(props: { content: string }) {
  return (
    <ReactMarkdownBlock
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const isMermaid = match && match[1] === 'mermaid';

          if (isMermaid) {
            return <MermaidBlock code={String(children).replace(/\n$/, '')} />;
          }

          return (
            <code className={className} {...rest}>
              {children}
            </code>
          );
        },
      }}
    >
      {props.content}
    </ReactMarkdownBlock>
  );
}
