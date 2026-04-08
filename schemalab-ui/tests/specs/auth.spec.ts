import { test, expect } from '@playwright/test';
import { registerAndLoginViaUi, registerViaUi, loginViaUi } from '../helpers/auth.helper';
import { createTestUser, TestUser, malformPassword } from '../helpers/user.factory';
import { ManagementPage } from '../pages/ProjectManagement';
import { RegisterPage } from '../pages/RegisterPage';

// test.afterEach(async ({ request }) => {
//     await request.delete(`/test/cleanup-user`);
// });

/* 
*
* The following tests check that all authentication functionalities work through the UI.
*
*/

/* 1. Test all aspects of registration */

// outcome: success and redirect to login page
test('Register a new user.', async ({ page }) => {

    // Register the User
    await registerViaUi(page, true);
});

// outcome: error on register
test('Register a existing user.', async ({ page }) => {

    const user = await registerViaUi(page, true);

    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    await registerPage.assertRegisterFailure();
});

/* 2. Test all aspects of login */

// outcome: success and redirect to projects page
test('Login a new user.', async ({ page }) => {
    await registerAndLoginViaUi(page);
});

// outcome: Failure with error message on login page.
test('Login a new user with incorrect details.', async ({ page }) => {
    const user = await registerViaUi(page, true);
    const newUser = malformPassword(user);
    await loginViaUi(page, newUser, false);
    await expect(page).toHaveURL('/login');
});

// outcome: Failure with error message on login page.
test('Login a user which doesnt exist.', async ({ page }) => {
    const user = createTestUser();
    await loginViaUi(page, user, false);
    await expect(page).toHaveURL('/login');
});

/* 3. Test ProfileDropDown component on the projects page */

// outcome: Success and modal to close. Dropdown to display new name.

// Skipped because auth route not implemented
test.skip('Change a users name.', async ({ page }) => {
    await registerAndLoginViaUi(page);
    const projectPage = new ManagementPage(page);
    await projectPage.settingsPopulateName("Testing NameChange");
    await projectPage.settingsClickAccept();
    await projectPage.checkName("Testing NameChange");
});

// outcome: Success and redirect to login page.
test('Logout.', async ({ page }) => {
    await registerAndLoginViaUi(page);
    const projectPage = new ManagementPage(page);
    await projectPage.logout();
});
