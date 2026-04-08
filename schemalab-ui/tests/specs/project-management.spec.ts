import { test } from '@playwright/test';
import { registerAndLoginViaUi } from '../helpers/auth.helper';
import { waitForAntdLoading } from '../helpers/general.helper';
import { DesignerTopbar } from '../pages/DesignerTopbar';
import { ManagementPage } from '../pages/ProjectManagement';
import { createProjectViaApi, deleteProjectViaApi, uniqueProjectName } from '../helpers/project.helper';

/**
 * The following tests cover the project management screen: listing, creating, renaming, and deleting projects.
 */

test.describe('Project management', () => {
    const createdProjectIds: number[] = [];

    test.afterEach(async ({ page }) => {
        while (createdProjectIds.length) {
            const id = createdProjectIds.pop();
            if (id) {
                await deleteProjectViaApi(page, id);
            }
        }
    });

    // Tests listing of projects
    test('lists newly created projects', async ({ page }) => {
        await registerAndLoginViaUi(page);
        const managementPage = new ManagementPage(page);

        const projectNames = [uniqueProjectName('ListA'), uniqueProjectName('ListB')];
        for (const name of projectNames) {
            const { id } = await createProjectViaApi(page, name);
            createdProjectIds.push(id);
        }

        await page.reload();
        await managementPage.waitForPageReady();

        for (const name of projectNames) {
            await managementPage.expectProjectVisible(name);
        }
    });

    // Tests creation of a new project
    test('creates a project from the projects page flow', async ({ page }) => {
        await registerAndLoginViaUi(page);
        const managementPage = new ManagementPage(page);
        const topbar = new DesignerTopbar(page);

        const projectName = uniqueProjectName('Create');
        await managementPage.clickNewProject();
        await topbar.waitForLoad();
        const projectId = await topbar.saveNewProject(projectName);
        createdProjectIds.push(projectId);

        await topbar.closeToProjects();
        await managementPage.expectProjectVisible(projectName);
    });

    // Tests renaming of a project
    test('renames a project and shows the updated name', async ({ page }) => {
        await registerAndLoginViaUi(page);
        const managementPage = new ManagementPage(page);
        const topbar = new DesignerTopbar(page);

        const originalName = uniqueProjectName('Rename');
        const updatedName = uniqueProjectName('Renamed');
        const { id } = await createProjectViaApi(page, originalName);
        createdProjectIds.push(id);

        await page.reload();
        await managementPage.waitForPageReady();

        await managementPage.openProject(originalName);
        await topbar.waitForLoad();
        await topbar.renameProject(updatedName);
        await topbar.closeToProjects();

        await managementPage.expectProjectVisible(updatedName);
        await managementPage.expectProjectNotVisible(originalName);
    });

    // Tests deletion of a project
    test('deletes a project from the projects page', async ({ page }) => {
        await registerAndLoginViaUi(page);
        const managementPage = new ManagementPage(page);

        const projectName = uniqueProjectName('Delete');
        const { id } = await createProjectViaApi(page, projectName);
        createdProjectIds.push(id);

        await page.reload();
        await waitForAntdLoading(page);
        await managementPage.expectProjectVisible(projectName);

        await managementPage.deleteProject(projectName);
    });
});
