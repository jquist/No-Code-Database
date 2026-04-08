import React from "react";
import { BaseEdge, getBezierPath, Position } from "reactflow";

export interface OneToOneEdgeProps {
    id?: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    sourcePosition: Position,
    targetPosition: Position,
    markerEnd?: string,
}



export const OneToOneEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
}: OneToOneEdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const isReversed = targetX < sourceX;

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
            <text
                x={labelX}
                y={labelY - 10}
                fontSize={12}
                textAnchor="middle"
                dominantBaseline="middle">
                1 : 1
            </text>
        </>
    )
}