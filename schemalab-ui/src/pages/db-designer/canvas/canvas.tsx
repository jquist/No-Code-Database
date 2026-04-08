import React, { useCallback, useState, useMemo } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  OnEdgesChange,
  MiniMap,
  ReactFlowInstance,
} from "reactflow";
import { EdgeMarkers } from "../elements/relationships/leftMarkerEdge";
import "reactflow/dist/style.css";
import "./canvas.css";
import { TableNode } from "../elements/tableNode/table-node";
import { ManyToManyEdge } from "../elements/relationships/M2M";
import { OneToManyEdge } from "../elements/relationships/O2M";
import { OneToOneEdge } from "../elements/relationships/O2O";
import { EdgeMenu } from "./edgeMenu";
import { useCanvasContext } from "../../../contexts/canvas-context";

// Define the custom edge types outside the component
const edgeTypes = {
  manyToManyEdge: ManyToManyEdge,
  oneToManyEdge: OneToManyEdge,
  oneToOneEdge: OneToOneEdge,
};

export function Canvas() {
  const { projectName, nodes, setNodes, edges, setEdges, onNodesChange, viewport, setViewport, setSelectedNodes, contextHolder, selectedEdge, setSelectedEdge, menuPos, setMenuPos } = useCanvasContext();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const onInit = (instance: ReactFlowInstance) => {
    setRfInstance(instance);

    if (viewport) {
      instance.setViewport(viewport, { duration: 0 });
    } else {
      instance.fitView({ padding: 1, duration: 0 });
    }
  }

  // Define updateNodeData before using it in useMemo
  const updateNodeData = useCallback(
    (id: string, newData: { label?: string; tableData?: string[][]; rowMeta?: any[]; dataModeRows?: string[][] }) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  // Memoize nodeTypes to avoid recreating it on each render
  const nodeTypes = useMemo(
    () => ({
      tableNode: (props: any) => <TableNode {...props} updateNodeData={updateNodeData} />,
    }),
    [updateNodeData]
  );

  // compute join table position to the right of the rightmost table
  const computeJoinTablePosition = useCallback(
    (idA: string, idB: string, spacing = 50, defaultWidth = 240) => {
      // prefer live nodes from the ReactFlow instance if available
      const liveNodes = rfInstance?.getNodes?.() ?? nodes;

      const a = liveNodes.find((n: any) => n.id === idA) ?? nodes.find((n: any) => n.id === idA);
      const b = liveNodes.find((n: any) => n.id === idB) ?? nodes.find((n: any) => n.id === idB);

      const aPos = a?.position ?? { x: 0, y: 0 };
      const bPos = b?.position ?? { x: 0, y: 0 };

      // use `any` casts for internal props that Reactflow doesn't expose in the Node type
      const aAny: any = a;
      const bAny: any = b;

      const aWidth = (aAny?.__rf?.width ?? aAny?.width ?? defaultWidth) as number;
      const bWidth = (bAny?.__rf?.width ?? bAny?.width ?? defaultWidth) as number;

      const aRight = aPos.x + aWidth;
      const bRight = bPos.x + bWidth;

      const rightmost = aRight >= bRight ? a : b;
      const rightmostPos = rightmost?.position ?? { x: 0, y: 0 };
      const rightmostAny: any = rightmost;
      const rightmostWidth = (rightmostAny?.__rf?.width ?? rightmostAny?.width ?? defaultWidth) as number;

      const x = rightmostPos.x + rightmostWidth + spacing;
      const y = Math.round((aPos.y + bPos.y) / 2);

      return { x, y };
    },
    [rfInstance, nodes]
  );

  // Wrapper for onEdgesChange
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) =>
        changes.reduce((acc, change) => {
          switch (change.type) {
            case "add":
              return [...acc, change.item];
            case "remove":
              return acc.filter((edge) => edge.id !== change.id);
            default:
              return acc;
          }
        }, eds)
      );
    },
    [setEdges]
  );

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setMenuPos({ x: event.clientX, y: event.clientY });
  };

  const updateEdgeType = (newType: string) => {
    if (selectedEdge && newType === "manyToManyEdge") {
      // Remove the original edge
      setEdges((eds) => eds.filter(e => e.id !== selectedEdge.id));

      // Create join table node
      const joinTableId = `join_${selectedEdge.source}_${selectedEdge.target}_${Date.now()}`;
      const pos = computeJoinTablePosition(selectedEdge.source, selectedEdge.target, 50);
      const joinTableNode = {
        id: joinTableId,
        type: "tableNode",
        position: pos,
        data: {
          label: `${selectedEdge.source}_${selectedEdge.target}`,
          tableData: [
            [`${selectedEdge.source}_id`],
            [`${selectedEdge.target}_id`],
          ],
          rowMeta: [
            { type: "INT", nn: true, pk: false, unique: false },
            { type: "INT", nn: true, pk: false, unique: false },
          ],
          dataModeRows: [["", ""]],
        },
      };

      setNodes((nds) => [...nds, joinTableNode]);

      // Add one-to-many edges from join table to both tables
      setEdges((eds) => [
        ...eds,
        {
          id: `edge_${joinTableId}_${selectedEdge.source}`,
          source: joinTableId,
          sourceHandle: "row-0-left",
          target: selectedEdge.source,
          targetHandle: "row-0-right", // connect to left side of source table
          type: "oneToManyEdge",
        },
        {
          id: `edge_${joinTableId}_${selectedEdge.target}`,
          source: joinTableId,
          sourceHandle: "row-1-left",
          target: selectedEdge.target,
          targetHandle: "row-0-right", // connect to left side of target table
          type: "oneToManyEdge",
        },
      ]);
      setSelectedEdge(null);
      setMenuPos(null);
      return;
    }

    // Default: just update the type
    setEdges((eds) =>
      eds.map((e) => (e.id === selectedEdge!.id ? { ...e, type: newType } : e))
    );
    setSelectedEdge(null);
    setMenuPos(null);
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // check if (params as Edge).type exists and is 'manyToManyEdge'
      if ('type' in params && params.type === "manyToManyEdge") {
        // 1. Create a join table node (position computed to the right of the rightmost table)
        const joinTableId = `join_${params.source}_${params.target}_${Date.now()}`;
        const pos = computeJoinTablePosition(params.source as string, params.target as string, 50);
        const joinTableNode = {
          id: joinTableId,
          type: "tableNode",
          position: pos,
          data: {
            label: `${params.source}_${params.target}`,
            tableData: [
              [`${params.source}_id`],
              [`${params.target}_id`],
            ],
            rowMeta: [
              { type: "INT", nn: true, pk: false, unique: false },
              { type: "INT", nn: true, pk: false, unique: false },
            ],
            dataModeRows: [["", ""]],
          },
        };

        // 2. Add the join table node
        setNodes((nds) => [...nds, joinTableNode]);

        // 3. Add one-to-many edges from join table to both tables
        setEdges((eds) => [
          ...eds,
          {
            id: `edge_${joinTableId}_${params.source}`,
            source: joinTableId,
            sourceHandle: "row-0-left",
            target: params.source,
            targetHandle: "row-0-right", // connect to right side of source table
            type: "oneToManyEdge",
          },
          {
            id: `edge_${joinTableId}_${params.target}`,
            source: joinTableId,
            sourceHandle: "row-1-left",
            target: params.target,
            targetHandle: "row-0-right", // connect to right side of target table
            type: "oneToManyEdge",
          },
        ]);
      } else {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              type: "oneToOneEdge",
            },
            eds
          )
        );
      }
    },
    [setEdges, setNodes, nodes]
  );

  return (
    <>
      {contextHolder}
      <div className="canvas-container">
        <EdgeMarkers />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange} // Use the context's onNodesChange
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes} // Use memoized nodeTypes
          edgeTypes={edgeTypes}
          onEdgeClick={onEdgeClick}
          onInit={onInit}
          onSelectionChange={({ nodes }) => setSelectedNodes(nodes)}
          onPaneClick={() => { setSelectedNodes([]); setSelectedEdge(null) }}

          onMove={(_, viewport) => setViewport(viewport)}
        >
          <MiniMap nodeStrokeWidth={3} />
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      {selectedEdge && menuPos && (
        <EdgeMenu menuPos={menuPos} updateEdgeType={updateEdgeType} />
      )}
    </>
  );
}