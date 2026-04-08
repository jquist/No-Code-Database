import { useState } from "react";
import { Edge } from "reactflow";
import { Popover } from "antd";
import { useCanvasContext } from '../../../contexts/canvas-context';
import bin from "../../../assets/bin.svg";

interface EdgeMenuProps {
    menuPos: {x: number, y: number}
    updateEdgeType: (newType: string) => void;
}

export const EdgeMenu = ({ updateEdgeType }: EdgeMenuProps) => {
    const [open, setOpen] = useState(true);
    const { menuPos, deleteSelectedEdge } = useCanvasContext();

    if (!menuPos) return null;
    
    return(
        <Popover
            open={ open }
            onOpenChange={setOpen}
            placement="top"
            trigger="click"
            content={
                <>
                    <div onClick={() => updateEdgeType("oneToOneEdge")} className="edge-menu-item">1 : 1</div>
                    <div onClick={() => updateEdgeType("oneToManyEdge")} className="edge-menu-item">1 : N</div>
                    <div onClick={() => updateEdgeType("manyToManyEdge")} className="edge-menu-item">N : M</div>
                    <div onClick={() => deleteSelectedEdge()} className="edge-menu-item"><img src={bin} className="edge-menu-bin"/></div>
                </>
            }
        >
            <div
            style={{ 
                position: "fixed",
                top: menuPos.y, 
                left: menuPos.x,
                width: 1,
                height: 1,
            }}></div>
        </Popover>
    )
}