import { Page, expect } from '@playwright/test';
import { waitForAntdLoading } from '../helpers/general.helper';

export class LoginPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/login');
    }

    async login(email: string, password: string) {
        await expect(this.page.getByTestId('title')).toHaveText('Login to Account')

        await waitForAntdLoading(this.page);

        await this.page.fill('[data-testid="email_input"]', email);
        await this.page.fill('[data-testid="password_input"]', password);

        await this.page.click('[data-testid="login_button"]');
    }

    async assertLoggedIn() {
        await expect(this.page).toHaveURL('/projects');
        
    }
}