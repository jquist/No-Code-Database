import { Page, expect } from '@playwright/test';
import { waitForAntdLoading } from '../helpers/general.helper';

export class DesignerTopbar {
    constructor(private page: Page) {}

    async waitForLoad() {
        await this.page.waitForSelector('.topbar');
    }

    private async openProjectMenu() {
        await this.page.locator('.topbar .project a').click();
    }

    async saveNewProject(name: string): Promise<number> {
        await this.waitForLoad();
        await this.openProjectMenu();
        await this.page.getByRole('menuitem', { name: 'Save' }).click();

        const modal = this.page.getByRole('dialog');
        await modal.getByPlaceholder('Project Name (alphanumeric, max 20 chars)').fill(name);
        await modal.getByRole('button', { name: 'Save' }).click();

        await this.page.waitForURL(/\/dev\/db-designer\/\d+/, { waitUntil: 'networkidle' });
        const projectId = Number(this.page.url().split('/').pop());
        expect(Number.isFinite(projectId)).toBeTruthy();
        return projectId;
    }

    async renameProject(newName: string) {
        await this.waitForLoad();
        await this.openProjectMenu();
        await this.page.getByRole('menuitem', { name: 'Rename' }).click();

        const modal = this.page.getByRole('dialog');
        await modal.getByPlaceholder('Project Name (alphanumeric, max 20 chars)').fill(newName);
        await modal.getByRole('button', { name: 'Save' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async closeToProjects() {
        await this.waitForLoad();
        await this.openProjectMenu();
        await this.page.getByRole('menuitem', { name: 'Close' }).click();
        await this.page.waitForURL('**/projects');
        await waitForAntdLoading(this.page);
    }
}
