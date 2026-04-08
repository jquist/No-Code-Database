import { Page, expect } from '@playwright/test';

export class RegisterPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/register');
    }

    async register(first_name: string, last_name: string, email: string, password: string) {
        await expect(this.page.getByTestId('title')).toHaveText('Create Account')

        await this.page.fill('[data-testid="firstName_input"]', first_name);
        await this.page.fill('[data-testid="lastName_input"]', last_name);
        await this.page.fill('[data-testid="email_input"]', email);
        await this.page.fill('[data-testid="password_input"]', password);

        await this.page.click('[data-testid="register_button"]');
    }

    async assertRegisterSuccess() {
        await expect(this.page).toHaveURL('/login');
        
    }

    async assertRegisterFailure() {
        await expect(this.page).toHaveURL('/register');
        
    }
}