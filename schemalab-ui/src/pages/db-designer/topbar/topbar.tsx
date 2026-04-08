import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"; import "./topbar.scss"; // Import CSS for styling
import { Node, NodeProps } from "reactflow";
import Logo from "../../../assets/schemalab-logo-no-text.svg";
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Switch, Space, Button, Tooltip, Modal, Input, message, Checkbox } from 'antd';
import { useCanvasContext } from "../../../contexts/canvas-context";
import tableAdd from "../../../assets/TableAdd.svg";
import bin from "../../../assets/bin.svg";
import copy from "../../../assets/copy.svg";
import paste from "../../../assets/paste.svg";
import axios from "axios"; // Import axios for HTTP requests
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from '../../../contexts/auth-context';
import type { MenuProps } from 'antd';
import { formatCanvasData, mapProjectToNodesEdges, formatExportPayload } from "../../../utils/canvas-utils";

export interface TopBarProps {
    projectName?: string;
}

export const Topbar = ({ projectName }: TopBarProps) => {
    const {
        mode,
        setMode,
        handleCanvasData,
        nodes,
        edges,
        setNodes,
        setEdges,
        deleteSelectedNodes,
        copySelectedNodes,
        pasteNodes,
        setProjectName,
    } = useCanvasContext();
    const { fetchProjects } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputName, setInputName] = useState(projectName); // <-- Use context value
    const navigate = useNavigate();
    const schemaBaseUrl = process.env.REACT_APP_SCHEMA_URL;
    const location = useLocation();
    const { id: projectId } = useParams(); // <-- Get id from URL params

    // Export modal state: allow selecting both
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportSelection, setExportSelection] = useState<{ sql: boolean; db: boolean }>({ sql: true, db: false });
    const [isExporting, setIsExporting] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();
    const autoSaveMessageKey = "auto-save";

    const latestCanvasRef = useRef({
        nodes,
        edges,
        projectName: projectName || "Untitled Project",
    });

    useEffect(() => {
        latestCanvasRef.current = {
            nodes,
            edges,
            projectName: projectName || "Untitled Project",
        };
    }, [nodes, edges, projectName]);

    useEffect(() => {
        if (!projectId) return;

        const interval = setInterval(async () => {
            const { nodes: latestNodes, edges: latestEdges, projectName: latestName } = latestCanvasRef.current;
            const nameToSave = (latestName || "Untitled Project").trim() || "Untitled Project";

            try {
                const formattedData = formatCanvasData(latestNodes, latestEdges, nameToSave);
                await axios.put(
                    `${process.env.REACT_APP_MANAGEMENT_URL}/api/projects/${projectId}/`,
                    {
                        name: nameToSave,
                        data: formattedData,
                    });
                messageApi.open({
                    key: autoSaveMessageKey,
                    type: "success",
                    content: "Auto-save complete.",
                    duration: 1,
                });
            } catch (error) {
                messageApi.open({
                    key: autoSaveMessageKey,
                    type: "error",
                    content: "Auto-save failed. Changes may be unsaved.",
                    duration: 3,
                });
            }
        }, 120000); // Auto-save every 2 minutes.

        return () => clearInterval(interval);
    }, [projectId, messageApi]);

    useEffect(() => {
        setInputName(projectName); // Always sync inputName with context
    }, [projectName]);

    const handleSaveClick = () => {
        if (!projectId) {
            setIsModalOpen(true); // Modal will sync inputName via useEffect
        } else {
            handleModalOk(); // Directly save if id exists
        }
    };

    const handleModalOk = async () => {
        const nameToSave = (inputName || projectName || "Untitled Project").trim();
        if (!nameToSave) {
            messageApi.warning("Project name cannot be empty.");
            return;
        }

        try {
            setProjectName(nameToSave);
            const formattedData = formatCanvasData(nodes, edges, nameToSave);

            if (projectId) {
                await axios.put(
                    `${process.env.REACT_APP_MANAGEMENT_URL}/api/projects/${projectId}/`,
                    {
                        name: nameToSave,
                        data: formattedData,
                    });
                await fetchProjects();
                messageApi.success("Project updated successfully!");
            } else {
                const { data: createdProject } = await axios.post(
                    `${process.env.REACT_APP_MANAGEMENT_URL}/api/projects/`,
                    {
                        name: nameToSave,
                        data: formattedData,
                    });

                const mapped = mapProjectToNodesEdges({ data: formattedData.data, name: nameToSave });
                setNodes(mapped.nodes);
                setEdges(mapped.edges);
                setProjectName(nameToSave);

                await fetchProjects();
                messageApi.success("Canvas data saved successfully!");

                if (createdProject?.id) {
                    navigate(`/dev/db-designer/${createdProject.id}`, {
                        state: { projectData: { ...createdProject, data: formattedData.data } },
                    });
                }
            }

            setIsModalOpen(false);
        } catch (error: any) {
            const backendMsg =
                error?.response?.data?.name?.[0] ||
                error?.response?.data?.detail ||
                "Failed to save canvas data.";
            messageApi.error(backendMsg);
            setIsModalOpen(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    // New export handler for multiple selections
    const handleExportConfirm = useCallback(async () => {
        // ensure canvas data is current
        handleCanvasData();

        if (!exportSelection.sql && !exportSelection.db) {
            messageApi.warning("Select at least one export option (SQL and/or DB).");
            return;
        }

        if (isExporting) return;

        setIsExporting(true);

        try {
            const payload = formatExportPayload(nodes, edges, projectName ?? "Untitled Project");
            console.log("Export Payload:", payload);

            // POST to path: /build
            const postUrl = `${schemaBaseUrl}/build`;
            const { data } = await axios.post(postUrl, payload);
            const fileName = data?.data?.fileName;
            if (!fileName) {
                throw new Error("Schema service did not return a file name.");
            }

            // sequential downloads to avoid popup blocks
            if (exportSelection.sql) {
                try {
                    const fileResponse = await axios.get(`${schemaBaseUrl}/build/SQL`, {
                        responseType: "blob",
                        params: { fileName },
                    });
                    const blob = new Blob([fileResponse.data], { type: "application/sql" });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${fileName}.sql`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                } catch (err) {
                    console.warn("Failed to download SQL:", err);
                    messageApi.error("Failed to download SQL file.");
                }
            }

            if (exportSelection.db) {
                try {
                    const fileResponse = await axios.get(`${schemaBaseUrl}/build/DB`, {
                        responseType: "blob",
                        params: { fileName },
                    });
                    const blob = new Blob([fileResponse.data], { type: "application/octet-stream" });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${fileName}.db`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                } catch (err) {
                    console.warn("Failed to download DB:", err);
                    messageApi.error("Failed to download DB file.");
                }
            }

            // success message(s)
            if (exportSelection.sql && exportSelection.db) {
                messageApi.success("SQL and DB downloaded.");
            } else if (exportSelection.sql) {
                messageApi.success("SQL downloaded.");
            } else if (exportSelection.db) {
                messageApi.success("DB downloaded.");
            }
        } catch (err: any) {
            const backendMsg = err?.response?.data?.message ?? err.message ?? "Export failed.";
            messageApi.error(backendMsg);
        } finally {
            setIsExporting(false);
            setExportModalOpen(false);
        }
    }, [edges, handleCanvasData, isExporting, messageApi, nodes, projectName, schemaBaseUrl, exportSelection]);

    const handleRenameClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (projectId) {
            setIsModalOpen(true);
        }
    };

    const items: MenuProps['items'] = useMemo(() => ([
        {
            key: 1,
            label: (
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/dev/db-designer'); // Navigate to the new project page
                    }}>New</a>
            ),
        },
        {
            key: 2,
            label: (<a onClick={handleSaveClick}>Save</a>)
        },
        projectId ? {
            key: 3,
            label: (<a onClick={handleRenameClick}>Rename</a>)
        } : null,
        {
            key: 4,
            label: (<a onClick={(e) => { e.preventDefault(); setExportModalOpen(true); }}>Export</a>)
        },
        {
            key: 5,
            label: (
                <a
                    onClick={async (e) => {
                        e.preventDefault();
                        await fetchProjects();
                        navigate("/projects");
                    }}>Close</a>
            ),
        },
    ].filter(Boolean) as MenuProps['items']), [projectId, handleSaveClick, fetchProjects, navigate]);

    const addTable = () => {
        const offset = 50;

        const lastNode = nodes[nodes.length - 1];

        const newPos = lastNode ? {
            x: lastNode.position.x + offset,
            y: lastNode.position.y + offset,
        } : { x: 250, y: 250 };

        const newId = String(nodes.length + 1)
        const newNode: Node = {
            id: newId,
            type: "tableNode",
            data: { label: `Table ${newId}` },
            position: newPos,
        }

        setNodes((nds) => [...nds, newNode]);
    }

    return (
        <div className="topbar">
            {contextHolder}
            <div className="topbar-start">
                <a href="/projects">
                    <img src={Logo} alt="Schemalab Logo" className="logo" />
                </a>

                <div className="project">
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                {projectName || 'Unititled Project'}
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </div>
            </div>
            <div className="topbar-middle">
                <Space direction="vertical">
                    <Switch
                        checkedChildren="Data"
                        unCheckedChildren="Build"
                        checked={mode === "data"}
                        onChange={(checked) => setMode(checked ? "data" : "build")}
                        className="switch"
                    />
                </Space>
            </div>
            <div className="topbar-end">
                <div className="tools">
                    <Tooltip title="Add Table">
                        <Button type="text" className="tool-btn" onClick={addTable}>
                            <img className="tool-icon--Add" src={tableAdd} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete Selected">
                        <Button type="text" className="tool-btn" onClick={deleteSelectedNodes}>
                            <img className="tool-icon" src={bin} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Copy Selected">
                        <Button type="text" className="tool-btn" onClick={copySelectedNodes}>
                            <img className="tool-icon" src={copy} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Paste Selected">
                        <Button type="text" className="tool-btn" onClick={pasteNodes}>
                            <img className="tool-icon" src={paste} />
                        </Button>
                    </Tooltip>

                </div>
            </div>
            <Modal
                title="Save Project"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Save"
            >
                <Input
                    placeholder="Project Name (alphanumeric, max 20 chars)"
                    maxLength={20}
                    value={inputName}
                    onChange={e => setInputName(e.target.value)} // <-- Only update local state
                />
            </Modal>

            <Modal
                title="Export Project"
                open={exportModalOpen}
                onOk={handleExportConfirm}
                onCancel={() => setExportModalOpen(false)}
                okText={isExporting ? "Exporting..." : "Export"}
                okButtonProps={{ disabled: isExporting, loading: isExporting }}
            >
                <div style={{ marginBottom: 12 }}>
                    <Checkbox
                        checked={exportSelection.sql}
                        onChange={(e) => setExportSelection(s => ({ ...s, sql: e.target.checked }))}
                    >
                        Export as SQL
                    </Checkbox>
                    <Checkbox
                        style={{ marginLeft: 16 }}
                        checked={exportSelection.db}
                        onChange={(e) => setExportSelection(s => ({ ...s, db: e.target.checked }))}
                    >
                        Export as DB
                    </Checkbox>
                </div>
                <div style={{ color: "#666", fontSize: 12 }}>
                    Select one or both export formats. The SQL option creates a .sql file; DB creates a .db file.
                </div>
            </Modal>
        </div>
    );
};  