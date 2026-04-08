import React from "react";
import { BaseEdge, getBezierPath, Position } from "reactflow";
import ManyMandatory from "../../../../assets/toolbox/ManyMandatory.svg";
import ManyOptional from "../../../../assets/toolbox/ManyMandatory.svg";

export interface ManyToManyEdgeProps {
    id?: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    sourcePosition: Position,
    targetPosition: Position,
}

export const ManyToManyEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
}: ManyToManyEdgeProps) => {
    const adjustedSourceX = sourceX - 33;
    const adjustedTargetX = targetX + 33;
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: adjustedSourceX,
        sourceY,
        targetX: adjustedTargetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerStart={`url(#many-end)`} markerEnd={`url(#many-start)`} />
            <text
                x={labelX}
                y={labelY - 10}
                fontSize={12}
                textAnchor="middle"
                dominantBaseline="middle">
                N : M
            </text>
        </>
    )
}