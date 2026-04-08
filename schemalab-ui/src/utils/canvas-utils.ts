function normalizeTable(node: any) {
    const rawTableRows = Array.isArray(node?.data?.tableData)
        ? node.data.tableData.filter((row: string[]) => Array.isArray(row))
        : [];

    const normalizedTableRows = rawTableRows.map((row: string[]) =>
        row.map((cell) => (typeof cell === "string" ? cell : ""))
    );

    const columnNames = normalizedTableRows.map((row: string[]) =>
        row && row.length > 0 ? String(row[0] ?? "").trim() : ""
    );

    const rawRowMeta = Array.isArray(node?.data?.rowMeta) ? node.data.rowMeta : [];
    const attributes = columnNames.map((_: string, index: number) => {
        const meta: Record<string, any> = rawRowMeta[index] || {};
        return {
            type: typeof meta.type === "string" && meta.type.trim() ? meta.type : "TEXT",
            nn: Boolean(meta.nn),
            pk: Boolean(meta.pk),
            unique: Boolean(meta.unique),
            default: typeof meta.default === "string" ? meta.default : "",
        };
    });

    const columnCount = Math.max(1, columnNames.length || rawRowMeta.length || 1);

    const normalizedDataModeRowsRaw = Array.isArray(node?.data?.dataModeRows)
        ? node.data.dataModeRows.map((row: string[]) => {
            if (!Array.isArray(row)) {
                return Array.from({ length: columnCount }, () => "");
            }
            const trimmed = row.slice(0, columnCount).map((cell) => (typeof cell === "string" ? cell : ""));
            while (trimmed.length < columnCount) {
                trimmed.push("");
            }
            return trimmed;
        })
        : [];

    const dataModeRows = normalizedDataModeRowsRaw.length
        ? normalizedDataModeRowsRaw
        : [Array.from({ length: columnCount }, () => "")];

    return {
        id: node.id,
        name: node.data?.label,
        position: node.position,
        data: columnNames,
        tableData: normalizedTableRows,
        attributes,
        dataModeRows,
    };
}

export function formatCanvasData(nodes: any[], edges: any[], projectName: string) {
    const tables = nodes.map((node) => normalizeTable(node));

    const relationships = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? "",
        targetHandle: edge.targetHandle ?? "",
        type: edge.type || "unknown",
    }));

    return {
        data: {
            projectName,
            canvas: {
                tables,
                relationships,
                length: nodes.length,
            },
        },
        time: new Date().toISOString(),
    };
}

export function mapProjectToNodesEdges(projectData: any) {
    const nodes = (projectData?.data?.canvas?.tables || []).map((table: any) => {
        const storedTableRows = Array.isArray(table.tableData)
            ? table.tableData.filter((row: any) => Array.isArray(row))
            : [];

        const columnNames = Array.isArray(table.data)
            ? table.data.map((col: any) => (typeof col === "string" ? col : ""))
            : [];

        const tableRows = storedTableRows.length
            ? storedTableRows.map((row: any[]) => row.map((cell) => (typeof cell === "string" ? cell : "")))
            : columnNames.map((name: string) => [name, ""]);

        const defaultMeta = () => ({
            type: "TEXT",
            nn: false,
            pk: false,
            unique: false,
            default: "",
        });

        let rowMeta = Array.isArray(table.attributes)
            ? table.attributes.map((meta: any) => ({
                type: typeof meta?.type === "string" && meta.type.trim() ? meta.type : "TEXT",
                nn: Boolean(meta?.nn),
                pk: Boolean(meta?.pk),
                unique: Boolean(meta?.unique),
                default: typeof meta?.default === "string" ? meta.default : "",
            }))
            : [];

        while (rowMeta.length < tableRows.length) {
            rowMeta.push(defaultMeta());
        }
        if (rowMeta.length > tableRows.length) {
            rowMeta = rowMeta.slice(0, tableRows.length);
        }

        const columnCount = Math.max(1, tableRows.length);

        const normalizedDataModeRowsRaw = Array.isArray(table.dataModeRows)
            ? table.dataModeRows.map((row: any[]) => {
                if (!Array.isArray(row)) {
                    return Array.from({ length: columnCount }, () => "");
                }
                const trimmed = row.slice(0, columnCount).map((cell) => (typeof cell === "string" ? cell : ""));
                while (trimmed.length < columnCount) {
                    trimmed.push("");
                }
                return trimmed;
            })
            : [];

        const normalizedDataModeRows = normalizedDataModeRowsRaw.length
            ? normalizedDataModeRowsRaw
            : [Array.from({ length: columnCount }, () => "")];

        return {
            id: table.id,
            type: "tableNode",
            data: {
                label: table.name,
                tableData: tableRows.length ? tableRows : [["", ""]],
                rowMeta,
                dataModeRows: normalizedDataModeRows,
            },
            position: table.position,
        };
    });

    const edges = (projectData?.data?.canvas?.relationships || []).map((rel: any) => ({
        id: rel.id,
        source: rel.source,
        sourceHandle: rel.sourceHandle,
        target: rel.target,
        targetHandle: rel.targetHandle,
        type: rel.type,
    }));

    return { nodes, edges };
}

function sanitizeIdentifier(name: unknown): string {
    let s = typeof name === "string" ? name.trim() : String(name ?? "");
    // replace anything that is not A-Z a-z 0-9 or underscore with underscore
    s = s.replace(/[^A-Za-z0-9_]/g, "_");
    // ensure it starts with a letter or underscore
    if (!/^[A-Za-z_]/.test(s)) {
        s = "t_" + s;
    }
    // fallback for empty
    if (s.length === 0) s = "t_unnamed";
    return s;
}

export function formatExportPayload(nodes: any[], edges: any[], projectName: string) {
    const sanitizedProjectName = typeof projectName === "string" && projectName.trim()
        ? projectName.trim()
        : "Untitled Project";

    const tables = nodes.map((node) => {
        const normalized = normalizeTable(node);

        // sanitize table name and column names
        const safeTableName = sanitizeIdentifier(normalized.name ?? `table_${normalized.id}`);
        const safeData = Array.isArray(normalized.data)
            ? normalized.data.map((col, idx) => sanitizeIdentifier(col ?? `col_${idx}`))
            : [];

        // keep attributes and other payload the same, but ensure attribute->name alignment
        return {
            id: normalized.id,
            name: safeTableName,
            position: normalized.position,
            data: safeData,
            attributes: normalized.attributes,
            dataModelRows: normalized.dataModeRows,
        };
    });

    const relationships = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? "",
        targetHandle: edge.targetHandle ?? "",
        type: edge.type || "unknown",
    }));

    return {
        data: {
            projectName: sanitizedProjectName,
            canvas: {
                tables,
                relationships,
            },
        },
        time: new Date().toISOString(), // Current timestamp
    };
}