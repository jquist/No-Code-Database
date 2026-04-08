import React, { createContext, useContext, useState, useCallback, useEffect, Dispatch } from "react";
import { Node, Edge, OnNodesChange, applyNodeChanges } from "reactflow";
import type { Viewport } from 'reactflow';
import { formatCanvasData } from "../utils/canvas-utils";
import { message } from 'antd';

type Mode = "build" | "data";

export interface CanvasContextType {
    projectName: string;
    setProjectName: (name: string) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    nodes: Node[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    edges: Edge[];
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onNodesChange: OnNodesChange;
    handleCanvasData: () => void;
    viewport: Viewport;
    setViewport: Dispatch<any>;
    updateNodeData: (id: string, newData: any) => void;
    selectedNodes: Node[];
    selectedEdge: Edge | null;
    setSelectedNodes: React.Dispatch<Node[]>;
    setSelectedEdge: React.Dispatch<Edge | null>;
    deleteSelectedNodes: () => void;
    contextHolder: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
    menuPos: { x: number; y: number; } | null;
    setMenuPos: React.Dispatch<React.SetStateAction<{ x: number; y: number; } | null>>;
    deleteSelectedEdge: () => void;
    copySelectedNodes: () => void;
    pasteNodes: () => void;
}

// Define the type for the formatted data
interface FormattedCanvasData {
    data: {
        projectName: string;
        canvas: {
            tables: { id: string; name: string; position: { x: number; y: number }; data: any }[];
            relationships: {
                id: string;
                source: string;
                target: string;
                sourceHandle: string | null;
                targetHandle: string | null;
                type: string;
            }[];
            length: number;
        };
    };
    time: string;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

type TableNodeData = {
    label: string;
    tableData?: string[][];
    rowMeta?: any[];
    dataModeRows?: string[][];
};

const initialNodeTemplate: Node<TableNodeData>[] = [
    {
        id: "1",
        type: "tableNode",
        data: {
            label: "Table 1",
            tableData: [["ID"]], // One row of table data
            rowMeta: [
                {
                    type: "INT",    // Default type
                    nn: true,       // Not null
                    pk: true,       // Primary key
                    unique: true,   // Unique
                    default: "",    // Default value
                },
            ],
            dataModeRows: [["0"]],
        },
        position: { x: 500, y: 0 },
    },
    {
        id: "2",
        type: "tableNode",
        data: {
            label: "Table 2",
            tableData: [["ID"], ["Name"]],
            rowMeta: [
                {
                    type: "INT",
                    nn: true,
                    pk: true,
                    unique: true,
                    default: "0",
                },
                {
                    type: "TEXT",
                    nn: true,
                    pk: false,
                    unique: false,
                    default: "",
                },
            ],
            dataModeRows: [["0", "John Doe"]],
        },
        position: { x: 100, y: 100 },
    },
];

const initialEdgeTemplate: Edge[] = [
    { id: "e1-2", source: "1", sourceHandle: "row-0-left", target: "2", targetHandle: "row-1-right", type: "oneToManyEdge" },
];

export const initialNodes = initialNodeTemplate;
export const initialEdges = initialEdgeTemplate;

const cloneInitialNode = (node: Node<TableNodeData>): Node<TableNodeData> => ({
    ...node,
    data: {
        ...node.data,
        tableData: Array.isArray(node.data.tableData) && node.data.tableData.length
            ? node.data.tableData.map((row) => [...row])
            : [["", ""]],
        rowMeta: Array.isArray(node.data.rowMeta)
            ? node.data.rowMeta.map((meta) => ({ ...meta }))
            : [],
        dataModeRows: Array.isArray(node.data.dataModeRows) && node.data.dataModeRows.length
            ? node.data.dataModeRows.map((row) => [...row])
            : [[""]],
    },
});

const cloneInitialEdge = (edge: Edge): Edge => ({
    ...edge,
    data: edge.data ? { ...edge.data } : edge.data,
});

export const createInitialNodes = (): Node<TableNodeData>[] =>
    initialNodeTemplate.map((node) => cloneInitialNode(node));

export const createInitialEdges = (): Edge[] =>
    initialEdgeTemplate.map((edge) => cloneInitialEdge(edge));

const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectName, setProjectName] = useState('Undefined');
    const [mode, setMode] = useState<Mode>("build");
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
    const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);

    // Error messages for top bar buttons

    const errorTable = () => {
        messageApi.open({
            type: 'error',
            content: 'No tables selected'
        });
    };

    const errorEdge = () => {
        messageApi.open({
            type: 'error',
            content: 'No edges selected'
        });
    };

    const errorPaste = () => {
        messageApi.open({
            type: 'error',
            content: 'No tables copied.'
        });
    };

    // Persisting Logic

    const initialState = () => {
        const saved = localStorage.getItem(projectName);
        if (!saved) return { nodes: createInitialNodes(), edges: createInitialEdges(), viewport: undefined };

        try {
            const parsed = JSON.parse(saved);
            return {
                nodes: Array.isArray(parsed.nodes) ? parsed.nodes : createInitialNodes(),
                edges: Array.isArray(parsed.edges) ? parsed.edges : createInitialEdges(),
                viewport: parsed.viewport,
            };
        } catch {
            return { nodes: createInitialNodes(), edges: createInitialEdges(), viewport: undefined };
        }
    };

    const initial = initialState();

    const [nodes, setNodes] = useState<Node[]>(initial.nodes);
    const [edges, setEdges] = useState<Edge[]>(initial.edges);
    const [viewport, setViewport] = useState(initial.viewport);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

    useEffect(() => {
        const flow = { nodes, edges, viewport }
        localStorage.setItem(projectName, JSON.stringify(flow));
    }, [nodes, edges, viewport, projectName]);

    const updateNodeData = (id: string, newData: any) => {
        setNodes((prev) =>
            prev.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    // ************
    // Formatting Logic
    // ************

    // Explicitly type the state to include the formatted data structure, or null
    const [canvasData, setCanvasData] = useState<FormattedCanvasData | null>(null);

    // Callback to receive data from Canvas
    const handleCanvasData = useCallback(() => {
        const formattedData = formatCanvasData(nodes, edges, projectName);
        setCanvasData(formattedData); // Store the formatted data in state
        // change this later on to send request to schema maker
        console.log("Formatted Canvas Data:", formattedData); // Log or send the data
        return formattedData;
    }, [nodes, edges, projectName]);

    const onNodesChange: OnNodesChange = (changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    };

    const deleteSelectedNodes = () => {
        if (selectedNodes.length === 0) return errorTable();

        const idsToDelete = new Set(selectedNodes.map(n => n.id));

        setNodes((nds) => nds.filter((n) => !idsToDelete.has(n.id)));

        setEdges((eds) => eds.filter((e) => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)));

        // if (!selectedNode) return errorTable();

        // setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));

        // setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));

        setSelectedNodes([]);
    }

    const deleteSelectedEdge = () => {
        if (!selectedEdge) return errorEdge();

        setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
        setSelectedEdge(null);
        setMenuPos(null);
    }

    const copySelectedNodes = () => {
        if (selectedNodes.length === 0) return errorTable();

        setCopiedNodes(selectedNodes);
        messageApi.success("Table Successfully Copied.");
    }

    const pasteNodes = () => {
        if (!copiedNodes || copiedNodes.length === 0) return errorPaste();

        const pasted = copiedNodes.map((node) => {
            const newId = `${node.id}-${Date.now()}-${Math.random}`;

            return {
                ...node,
                id: newId,
                position: {
                    x: node.position.x + 40,
                    y: node.position.y + 40
                }
            };
        });

        setNodes((nds) => [...nds, ...pasted]);
        messageApi.success("Tables pasted.");
        // const newNode: Node = {
        //     ...copiedNode,
        //     id: newId,
        //     position: {
        //         x: copiedNode.position.x + 40,
        //         y: copiedNode.position.y + 40
        //     }
        // };

        // setNodes((nds) => [...nds, newNode]);
        // messageApi.success("Table pasted");
    }

    return (
        <CanvasContext.Provider value={{
            projectName,
            setProjectName,
            mode,
            setMode,
            nodes,
            setNodes,
            edges,
            setEdges,
            onNodesChange,
            handleCanvasData,
            viewport,
            setViewport,
            updateNodeData,
            selectedNodes,
            selectedEdge,
            setSelectedNodes,
            setSelectedEdge,
            deleteSelectedNodes,
            contextHolder,
            menuPos,
            setMenuPos,
            deleteSelectedEdge,
            copySelectedNodes,
            pasteNodes
        }}>
            {children}
        </CanvasContext.Provider>
    );
};

export const useCanvasContext = () => {
    const ctx = useContext(CanvasContext);
    if (!ctx) throw new Error("useCanvasContext must be used within a CanvasProvider");
    return ctx;
};

export { CanvasProvider };