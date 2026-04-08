import { Page, expect } from '@playwright/test';

export type CreatedProject = {
    id: number;
    name: string;
};

const MANAGEMENT_API_BASE = process.env.MANAGEMENT_API_BASE;

function buildProjectData(name: string) {
    return {
        data: {
            projectName: name,
            canvas: {
                tables: [],
                relationships: [],
                length: 0,
            },
        },
        time: new Date().toISOString(),
    };
}

async function getAccessToken(page: Page): Promise<string> {
    const storedUser = await page.evaluate(() => localStorage.getItem('user'));
    if (!storedUser) {
        throw new Error('No stored user token found in localStorage.');
    }
    const parsed = JSON.parse(storedUser);
    if (!parsed?.access) {
        throw new Error('Stored user is missing access token.');
    }
    return parsed.access as string;
}

export function uniqueProjectName(prefix = 'Project'): string {
    const random = Math.random().toString(36).replace(/[^a-z]+/gi, '').slice(0, 6).toUpperCase();
    const candidate = `${prefix} ${random}`.trim();
    return candidate.slice(0, 20);
}

export async function createProjectViaApi(page: Page, name: string): Promise<CreatedProject> {
    const access = await getAccessToken(page);
    const response = await page.request.post(`${MANAGEMENT_API_BASE}/api/projects/`, {
        headers: { Authorization: `Bearer ${access}` },
        data: { data: buildProjectData(name) },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    return { id: body.id as number, name };
}

export async function deleteProjectViaApi(page: Page, id: number): Promise<void> {
    const access = await getAccessToken(page);
    const response = await page.request.delete(`${MANAGEMENT_API_BASE}/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${access}` },
    });

    const status = response.status();
    if (![200, 204, 404].includes(status)) {
        expect(response.ok()).toBeTruthy();
    }
}

export async function updateProjectNameViaApi(page: Page, id: number, newName: string): Promise<void> {
    const access = await getAccessToken(page);
    const existingResp = await page.request.get(`${MANAGEMENT_API_BASE}/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${access}` },
    });
    expect(existingResp.ok()).toBeTruthy();
    const existing = await existingResp.json();

    const currentData = existing?.data ?? buildProjectData(newName);
    const updatedData = {
        ...currentData,
        data: {
            ...(currentData.data ?? {}),
            projectName: newName,
            canvas: currentData.data?.canvas ?? { tables: [], relationships: [], length: 0 },
        },
        time: currentData.time ?? new Date().toISOString(),
    };

    const response = await page.request.put(`${MANAGEMENT_API_BASE}/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${access}` },
        data: { data: updatedData },
    });

    expect(response.ok()).toBeTruthy();
}
