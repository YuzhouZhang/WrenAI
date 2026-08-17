import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
} from 'react';
import styled from 'styled-components';
import ReactFlow, {
  MiniMap,
  Background,
  Controls,
  ControlButton,
  useNodesState,
  useEdgesState,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { ModelNode, ViewNode } from './customNode';
import { ModelEdge } from './customEdge';
import Marker from './Marker';
import { DiagramContext, ClickPayload } from './Context';
import { trimId, highlightNodes, highlightEdges } from './utils';
import { Diagram as DiagramData } from '@/utils/data';
import { RefreshIcon } from '@/utils/icons';
import { EDGE_TYPE, NODE_TYPE } from '@/utils/enum';
import { DiagramCreator, Config } from '@/utils/diagram';
import { nextTick } from '@/utils/time';

import 'reactflow/dist/style.css';

const nodeTypes = {
  [NODE_TYPE.MODEL]: ModelNode,
  [NODE_TYPE.VIEW]: ViewNode,
};
const edgeTypes = {
  [EDGE_TYPE.MODEL]: ModelEdge,
};
const minimapStyle = {
  height: 120,
};

const StyledReactFlowContainer = styled.div<{ $initialized: boolean }>`
  height: 100%;
  width: 100%;
  opacity: ${(props) => (props.$initialized ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

interface Props {
  forwardRef?: ForwardedRef<unknown>;
  data: DiagramData;
  onMoreClick: (data: ClickPayload) => void;
  onNodeClick: (data: ClickPayload) => void;
  onAddClick: (data: ClickPayload) => void;
}

const ReactFlowDiagram = forwardRef(function ReactFlowDiagram(
  props: Props,
  ref,
) {
  const { data, onMoreClick, onNodeClick, onAddClick } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isFirstFit = useRef(true);
  const [initialized, setInitialized] = useState(false);
  const [forceRender, setForceRender] = useState(false);
  const reactFlowInstance = useReactFlow();
  useImperativeHandle(ref, () => reactFlowInstance, [reactFlowInstance]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const nodesInRow = useMemo(() => {
    if (!containerWidth) return Config.nodesInRow;
    const itemWidth = Config.width + Config.marginX;
    const availableWidth = containerWidth - 40;
    const calculated = Math.floor((availableWidth + Config.marginX) / itemWidth);
    return Math.max(1, calculated);
  }, [containerWidth]);

  const diagram = useMemo(() => {
    return new DiagramCreator(data, { nodesInRow }).toJsonObject();
  }, [data, nodesInRow]);

  useEffect(() => {
    setNodes(diagram.nodes);
    setEdges(diagram.edges);

    nextTick(50).then(() => {
      if (isFirstFit.current) {
        reactFlowInstance.fitView({ duration: 0 });
        isFirstFit.current = false;
        setInitialized(true);
      } else {
        reactFlowInstance.fitView({ duration: 0 });
      }
    });
  }, [diagram]);

  const [nodes, setNodes, onNodesChange] = useNodesState(diagram.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagram.edges);

  const onEdgeMouseEnter = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEdges(highlightEdges([edge.id], true));
      setNodes(
        highlightNodes(
          [edge.source, edge.target],
          [
            trimId(edge.sourceHandle as string),
            trimId(edge.targetHandle as string),
          ],
        ),
      );
    },
    [],
  );

  const onEdgeMouseLeave = useCallback(
    (_event: React.MouseEvent, _edge: Edge) => {
      setEdges(highlightEdges([], false));
      setNodes(highlightNodes([], []));
    },
    [],
  );

  const onRestore = async () => {
    setNodes(diagram.nodes);
    setEdges(diagram.edges);
    reactFlowInstance.fitView({ duration: 300 });
  };

  const onInit = async () => {
    await nextTick();
    if (isFirstFit.current) {
      reactFlowInstance.fitView({ duration: 0 });
      isFirstFit.current = false;
      setInitialized(true);
    } else {
      reactFlowInstance.fitView({ duration: 0 });
    }
    await nextTick(100);
    setForceRender(!forceRender);
  };

  const triggerMouseDown = (event: React.MouseEvent | MouseEvent) => {
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
      button: 0,
    });
    document.dispatchEvent(mouseDownEvent);
  };

  const isTargetInDropdown = (target: EventTarget | null) => {
    const dropdowns = document.querySelectorAll('.ant-dropdown');
    return Array.from(dropdowns).some((dropdown) =>
      dropdown.contains(target as Node),
    );
  };

  const dispatchMouseEvent = (event: React.MouseEvent | MouseEvent) => {
    if (!event.isTrusted || isTargetInDropdown(event.target)) return;
    triggerMouseDown(event);
  };

  return (
    <>
      <DiagramContext.Provider value={{ onMoreClick, onNodeClick, onAddClick }}>
        <StyledReactFlowContainer ref={containerRef} $initialized={initialized}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onInit={onInit}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            maxZoom={1}
            onPointerDown={(event) => dispatchMouseEvent(event)}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap style={minimapStyle} zoomable pannable />
            <Controls showInteractive={false}>
              <ControlButton onClick={onRestore}>
                <RefreshIcon style={{ maxWidth: 24, maxHeight: 24 }} />
              </ControlButton>
            </Controls>
            <Background gap={16} />
          </ReactFlow>
        </StyledReactFlowContainer>
      </DiagramContext.Provider>

      <Marker />
    </>
  );
});

const Diagram = (props: Props) => {
  return (
    <ReactFlowProvider>
      <ReactFlowDiagram ref={props.forwardRef} {...props} />
    </ReactFlowProvider>
  );
};

export default Diagram;
