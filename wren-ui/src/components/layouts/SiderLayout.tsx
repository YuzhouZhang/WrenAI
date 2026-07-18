import { Layout } from 'antd';
import styled, { css } from 'styled-components';
import SimpleLayout from '@/components/layouts/SimpleLayout';
import Sidebar from '@/components/sidebar';
import Settings from '@/components/settings';
import useModalAction from '@/hooks/useModalAction';

import { useState, useRef, useEffect } from 'react';

const { Sider } = Layout;

const basicStyle = css`
  height: calc(100vh - 48px);
  overflow: auto;
`;

const StyledContentLayout = styled(Layout)<{ color?: string }>`
  position: relative;
  ${basicStyle}
  ${(props) => props.color && `background-color: var(--${props.color});`}
`;

const StyledSider = styled(Sider)`
  ${basicStyle}
  transition: none !important; /* disable default transition during drag resizing */
`;

const StyledResizer = styled.div`
  width: 4px;
  cursor: col-resize;
  background-color: var(--gray-3);
  border-left: 1px solid var(--gray-4);
  z-index: 10;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background-color: var(--geekblue-5);
  }
`;

type Props = React.ComponentProps<typeof SimpleLayout> & {
  sidebar?: React.ComponentProps<typeof Sidebar>;
  color?: string;
};

const DEFAULT_SIDEBAR_WIDTH = 280;

function getInitialSidebarWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH;
  try {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
  } catch {
    return DEFAULT_SIDEBAR_WIDTH;
  }
}

export default function SiderLayout(props: Props) {
  const { sidebar, loading, color } = props;
  const settings = useModalAction();
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const isDragging = useRef(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
      document.documentElement.style.setProperty(
        '--sidebar-width',
        `${newWidth}px`,
      );
      localStorage.setItem('sidebarWidth', newWidth.toString());
      window.dispatchEvent(new Event('resize'));
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <SimpleLayout loading={loading}>
      <Layout className="adm-layout" hasSider>
        <StyledSider width={sidebarWidth} trigger={null} collapsible>
          <Sidebar {...sidebar} onOpenSettings={settings.openModal} />
        </StyledSider>
        <StyledResizer onMouseDown={startResize} />
        <StyledContentLayout color={color}>
          {props.children}
        </StyledContentLayout>
      </Layout>
      <Settings {...settings.state} onClose={settings.closeModal} />
    </SimpleLayout>
  );
}
