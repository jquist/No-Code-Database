import React from "react";
import { BaseEdge, getBezierPath, Position } from "reactflow";
import ManyMandatory from "../../../../assets/toolbox/ManyMandatory.svg";

// add optional flag

export interface OneToManyEdgeProps {
    id?: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    sourcePosition: Position,
    targetPosition: Position,
}

export const OneToManyEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
}: OneToManyEdgeProps) => {
    const adjustedTargetX = targetX + 34;

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX: adjustedTargetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const markerEndId = `${id}-arrow-end`;

    return (
        <>
            {/* Define the arrow markers */}
        
            <BaseEdge id={id} path={edgePath} markerEnd={`url(#many-start)`} />
            <text
                x={labelX}
                y={labelY - 10}
                fontSize={12}
                textAnchor="middle"
                dominantBaseline="middle">
                N : 1
            </text>
        </>
    )
}