import { Canvas } from "./canvas/canvas";
import { Topbar } from "./topbar/topbar";
import { ReactFlowProvider } from "reactflow";
import "./db-designer.scss";
import { useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useCanvasContext, createInitialNodes, createInitialEdges } from "../../contexts/canvas-context";
import axios from "axios";
import { mapProjectToNodesEdges } from "../../utils/canvas-utils";

export interface DbDesignerProps {
    example: string;
}

export function DbDesigner({ example }: DbDesignerProps) {
    const location = useLocation();
    const { id: projectId } = useParams();
    const { setNodes, setEdges, setProjectName } = useCanvasContext();
    const { projectName } = useCanvasContext();
    const { nodes, edges } = useCanvasContext(); // <-- get nodes/edges from context

    useEffect(() => {
        async function loadProject() {
            // Always clear previous canvas state first
            setNodes([]);
            setEdges([]);

            let projectData = location.state?.projectData;
            if (!projectData && projectId) {
                const res = await axios.get(`${process.env.REACT_APP_MANAGEMENT_URL}/api/projects/${projectId}/`);
                projectData = res.data;
            }
            if (projectData && projectData.data && projectData.data.canvas) {
                const { nodes, edges } = mapProjectToNodesEdges(projectData);
                setNodes(nodes);
                setEdges(edges);
                setProjectName(
                    projectData.name ||
                    projectData.data.projectName ||
                    projectData.projectName ||
                    "Untitled Project"
                );
            } else if (!projectId) {
                // Reset canvas for new project to initial state
                setNodes(createInitialNodes());
                setEdges(createInitialEdges());
                setProjectName("New Project");
            }
        }
        loadProject();
    }, [location.state, setNodes, setEdges, setProjectName, projectId]);

    // Add a derived key that changes when projectId or projectName changes
    const canvasKey = `${projectId || "new"}-${projectName}`;

    // Force reload by changing key on top-level div
    return (
        <div className="db-designer">
            <Topbar projectName={projectName} />
            <div className="canvas">
                <ReactFlowProvider key={canvasKey}>
                    <Canvas key={canvasKey} />
                </ReactFlowProvider>
            </div>
        </div>
    );
}