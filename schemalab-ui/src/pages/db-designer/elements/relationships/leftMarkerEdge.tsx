import { ReactComponent as ManyMandatory } from "../../../../assets/toolbox/ManyMandatory.svg";

// https://codepen.io/yurigor/pen/oYZLxV

export function EdgeMarkers() {
    return (
        <>
            <svg style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <marker
                        id="many-start"
                        viewBox="0 0 100 100"
                        markerHeight={35}
                        markerWidth={35}
                        refX={100}
                        refY={50}
                    >
                        <path d="M0 50 L100 50 M50 50 L 0 25 M50 50 L0 75 M75 25 L75 75" stroke="#b1b1b7" stroke-width="3"/>
                    </marker>

                    <marker
                        id="many-end"
                        viewBox="0 0 100 100"
                        markerHeight={35}
                        markerWidth={35}
                        refX={0}
                        refY={50}
                    >
                        <path d="M100 50 L0 50 M50 50 L 100 25 M50 50 L100 75 M25 25 L25 75" stroke="#b1b1b7" stroke-width="3"/>
                    </marker>
                </defs>
            </svg>
        </>
    );
}