import 'antd/dist/reset.css';
import './project-management.scss';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import React, { useState } from "react";
import { message, Modal } from "antd";
import { ProfileDropDown } from '../profileDropDown';
import { SettingsModal } from '../settingsModal';

interface ProjectCardProps {
    id: number;
    name: string;
    description: string;
    data?: any;
}

const ProjectCard = ({ id, name, description, data, messageApi }: ProjectCardProps & { messageApi: any }) => {
    const navigate = useNavigate();
    const { deleteProject, fetchProjects } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProjectClick = () => {
        if (!isModalOpen) {
            navigate(`/dev/db-designer/${id}`, { state: { projectData: data } }); // Pass project data
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        await deleteProject(id);
        messageApi.success("Successfully deleted", 2.5);
        await fetchProjects();
        setIsModalOpen(false);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div
            className={`project-card${isModalOpen ? " modal-open" : ""}`}
            onClick={handleProjectClick}
            style={isModalOpen ? { pointerEvents: "none", opacity: 0.7 } : {}}
        >
            <div className="project-canvas-preview">
                <div className="canvas-placeholder">
                    {data ? (
                        <div className="canvas-miniature">
                            {renderMiniDiagram(data)}
                        </div>
                    ) : (
                        <span>Picture of React Flow</span>
                    )}
                </div>
            </div>
            <div className="project-info-row">
                <h3 className="project-name">{name}</h3>
                <button className="delete-project-btn" onClick={handleDelete} title="Delete project">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="6" y="9" width="1.5" height="6" rx="0.75" fill="currentColor"/>
                        <rect x="9.25" y="9" width="1.5" height="6" rx="0.75" fill="currentColor"/>
                        <rect x="12.5" y="9" width="1.5" height="6" rx="0.75" fill="currentColor"/>
                        <rect x="4" y="6" width="12" height="2" rx="1" fill="currentColor"/>
                        <rect x="7" y="3" width="6" height="2" rx="1" fill="currentColor"/>
                        <rect x="2" y="6" width="16" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                        <rect x="5" y="8" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                </button>
            </div>
            <div className="project-info">
                {description && <p className="project-description">{description}</p>}
            </div>
            <Modal
                title="Delete Project"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete <b>{name}</b>? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

function renderMiniDiagram(data: any) {
    if (!data?.data?.canvas) return <span>No diagram</span>;

    const { tables = [], relationships = [] } = data.data.canvas;
    if (!tables.length) return <span>No diagram</span>;

    const VIEW_W = 200;
    const VIEW_H = 150;
    const PADDING = 1;
    const tableSize = { w: 40, h: 26 };

    type PositionedTable = { id: string; x: number; y: number };

    const positionedTables: PositionedTable[] = tables.map((table: any, index: number) => {
        const pos = table.position || { x: 0, y: 0 };
        const id = String(table.id ?? table.uuid ?? table.name ?? index);
        return {
            id,
            x: pos.x,
            y: pos.y,
        };
    });

    const minX = Math.min(...positionedTables.map((p) => p.x));
    const minY = Math.min(...positionedTables.map((p) => p.y));
    const maxX = Math.max(...positionedTables.map((p) => p.x + tableSize.w));
    const maxY = Math.max(...positionedTables.map((p) => p.y + tableSize.h));

    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);

    const scale = Math.min(
        1,
        (VIEW_W - PADDING * 2) / spanX,
        (VIEW_H - PADDING * 2) / spanY
    );

    const scaledTables: PositionedTable[] = positionedTables.map((table) => ({
        id: table.id,
        x: (table.x - minX) * scale + PADDING,
        y: (table.y - minY) * scale + PADDING,
    }));

    const centerById = new Map<string, { cx: number; cy: number }>(
        scaledTables.map((t) => [
            t.id,
            { cx: t.x + tableSize.w * scale / 2, cy: t.y + tableSize.h * scale / 2 },
        ])
    );

    return (
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="mini-diagram">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
                </filter>
            </defs>

            {relationships.map((rel: any) => {
                const source = centerById.get(String(rel.source));
                const target = centerById.get(String(rel.target));
                if (!source || !target) return null;
                return (
                    <line
                        key={rel.id ?? `${rel.source}-${rel.target}`}
                        x1={source.cx}
                        y1={source.cy}
                        x2={target.cx}
                        y2={target.cy}
                        stroke="#9aa4b2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                );
            })}

            {scaledTables.map((table) => (
                <g key={table.id} filter="url(#shadow)">
                    <rect
                        x={table.x}
                        y={table.y}
                        width={tableSize.w * scale}
                        height={tableSize.h * scale}
                        rx="4"
                        fill="#f3f4f6"
                        stroke="#2563eb"
                        strokeWidth="1.5"
                    />
                </g>
            ))}
        </svg>
    );
}

export const ProjectManagement = () => {
    const { projects, loading } = useAuth();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const safeProjects = Array.isArray(projects) ? projects : [];

    const handleNewProject = () => {
        navigate('/dev/db-designer');
    };

    if (loading) {
        return <div className="loading">Loading projects...</div>;
    }

    return (
        <div className="project-management-page">
            {contextHolder}
            <SettingsModal dataTestid="project"/>
            <header className="projects-header">
                <h1>Projects</h1>
                <ProfileDropDown dataTestid="project"/>
            </header>

            <div className="projects-tabs">
                <button className="tab active">Designs</button>
                <button className="tab">Schemas</button>
                <button className="new-project-btn" onClick={handleNewProject}>
                    + New Project
                </button>
            </div>

            <div className="projects-grid">
                {safeProjects.length === 0 ? (
                    <div className="empty-projects">No projects yet. Click "New Project" to start.</div>
                ) : (
                    safeProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            id={project.id}
                            name={
                                project.name ||
                                project.data?.projectName ||
                                project.data?.data?.projectName ||
                                "Untitled"
                            }
                            description={project.description}
                            data={project.data}
                            messageApi={messageApi}
                        />
                    ))
                )}
            </div>
        </div>
    );
};