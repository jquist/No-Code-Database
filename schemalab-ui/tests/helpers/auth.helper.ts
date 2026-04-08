import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ManagementPage } from '../pages/ProjectManagement';
import { createTestUser, TestUser} from './user.factory';
import { Page, expect } from '@playwright/test';

export async function registerViaUi(page: Page, checkSuccess: boolean): Promise<TestUser> {
    const user = createTestUser();

    // Register the User
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    if (checkSuccess) {
        await registerPage.assertRegisterSuccess();
    }

    return user;
}

export async function loginViaUi(page: Page, user: TestUser, checkSuccess: boolean): Promise<TestUser> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    if (checkSuccess) {
        await loginPage.assertLoggedIn();
    }

    return user;
}

export async function registerAndLoginViaUi(page: Page): Promise<TestUser> {

    // Register the User
    const user = await registerViaUi(page, true);

    await loginViaUi(page, user, true);

    return user;
}

export async function changeNameViaUi(page: Page, newName: string) {
    const managementPage = new ManagementPage(page);
    await managementPage.goto();
    await managementPage.settingsPopulateName(newName);
    await managementPage.settingsClickAccept();
    await managementPage.checkName(newName);
}

export async function logoutViaUi(page: Page) {
    const managementPage = new ManagementPage(page);
    await managementPage.goto();
    await managementPage.logout();
    await expect(page).toHaveURL('/login');
}



