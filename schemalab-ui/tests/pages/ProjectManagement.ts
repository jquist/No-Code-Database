import { Page, expect } from '@playwright/test';
import { waitForAntdLoading } from '../helpers/general.helper';

export class ManagementPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/projects');
    }

    async waitForPageReady() {
        await waitForAntdLoading(this.page);
    }

    async openDropDown() {
        await this.page.click('[data-testid="project-dropdown"]');
    }

    async openSettings() {
        await this.openDropDown();
        await this.page.click('[data-testid="project-dropdown-settings"]');
    }

    async checkName(expectedName: string) {
        await this.openDropDown();
        const name = await this.page.getByTestId('project-dropdown-name').innerText();

        expect(name?.trim()).toBe(expectedName);
    }

    async logout() {
        await this.openDropDown();
        await this.page.click('[data-testid="project-dropdown-logout"]');
    }

    private projectCard(name: string) {
        return this.page.locator('.project-card', {
            has: this.page.getByRole('heading', { name, exact: true }),
        });
    }

    async expectProjectVisible(name: string) {
        await expect(this.projectCard(name)).toBeVisible();
    }

    async expectProjectNotVisible(name: string) {
        await expect(this.projectCard(name)).toHaveCount(0);
    }

    async clickNewProject() {
        await this.page.getByRole('button', { name: '+ New Project' }).click();
    }

    async openProject(name: string) {
        await this.projectCard(name).click();
    }

    async deleteProject(name: string) {
        const card = this.projectCard(name);
        await card.getByTitle('Delete project').click();
        await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
        await waitForAntdLoading(this.page);
        await this.expectProjectNotVisible(name);
    }

    async settingsPopulateName(name: string) {
        await this.openSettings();
        const [firstName = "", ...rest] = (name ?? "").split(" ");
        const lastName = rest.join(" ");

        await this.page.fill('[data-testid="project-modal-first_name"]', firstName);
        await this.page.fill('[data-testid="project-modal-last_name"]', lastName);
    }

    // assumes settings is already open
    async settingsClickAccept() {
        await this.page.click('[data-testid="project-modal-ok"]');
    }

}