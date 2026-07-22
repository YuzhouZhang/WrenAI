import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

const StyledMermaidContainer = styled.div`
  position: relative;
`;

function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dots, setDots] = useState<string>('.');

  // 记录上一次成功渲染的 SVG，防止流式输出报错时闪烁回源码
  const lastValidSvg = useRef<string>('');
  // 记录上一次真正渲染的时间戳，用于 500ms 节流 (Throttle)
  const lastRenderTime = useRef<number>(0);

  // 动态递增省略号 '.' -> '..' -> '...' -> '.'
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;
    let idleTimer: NodeJS.Timeout | null = null;

    // 代码变动，标记为流式生成中
    setIsGenerating(true);

    // 2500ms 无新字符传入时，认为 AI 已经生成完毕/停顿，隐藏生成角标（防止流式中途微停顿导致角标消失）
    idleTimer = setTimeout(() => {
      if (isMounted) setIsGenerating(false);
    }, 2500);

    const renderDiagram = async () => {
      lastRenderTime.current = Date.now();
      // 每次渲染生成随机唯一的 renderId，避免因为相同的 ID 覆盖导致 CSS 样式短暂失效闪白
      const renderId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
      try {
        const { svg: renderedSvg } = await mermaid.render(renderId, code);
        if (isMounted) {
          setSvg(renderedSvg);
          lastValidSvg.current = renderedSvg;
          setError(false);
        }
      } catch (err) {
        if (isMounted) {
          if (!lastValidSvg.current) {
            // 如果之前没有渲染成功过，则立刻报错回退至源码
            setError(true);
            console.error('Mermaid 渲染失败:', err);
          } else {
            // 已经有成功渲染的 SVG，我们坚决不把 error 设为 true（不回退显示源码）
            // 在流式输出或手动编辑期间遇到语法错误时，静默保留上一版图表
            console.warn(
              'Mermaid 增量渲染遇到语法错误（保留上一版图表）:',
              err,
            );
          }
        }
        const errorNode = document.getElementById(renderId);
        if (errorNode) errorNode.remove();
      }
    };

    // 500ms 节流：计算距离上次渲染已过去多久
    const now = Date.now();
    const elapsed = now - lastRenderTime.current;
    const THROTTLE_INTERVAL = 500;

    if (elapsed >= THROTTLE_INTERVAL) {
      renderDiagram();
    } else {
      timer = setTimeout(() => {
        renderDiagram();
      }, THROTTLE_INTERVAL - elapsed);
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [code]);

  if (error || (!svg && !lastValidSvg.current)) {
    return (
      <pre>
        <code className="language-mermaid">{code}</code>
      </pre>
    );
  }

  const displaySvg = svg || lastValidSvg.current;

  const renderBadge = () => (
    <div className="flex items-center justify-center text-center mx-auto gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm pointer-events-none opacity-90">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
      <span>
        图表生成中<span className="inline-block w-4 text-left">{dots}</span>
      </span>
    </div>
  );

  return (
    <StyledMermaidContainer className="mermaid-container my-4 flex flex-col items-center justify-center overflow-x-auto bg-white p-4 rounded border border-gray-200">
      {isGenerating && <div className="mb-3">{renderBadge()}</div>}
      <div
        className="w-full flex justify-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: displaySvg }}
      />
      {isGenerating && <div className="mt-3">{renderBadge()}</div>}
    </StyledMermaidContainer>
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

const MARKDOWN_COMPONENTS = {
  code(props: any) {
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
};

export default function MarkdownBlock(props: { content: string }) {
  return (
    <ReactMarkdownBlock
      remarkPlugins={[remarkGfm]}
      components={MARKDOWN_COMPONENTS}
    >
      {props.content}
    </ReactMarkdownBlock>
  );
}
