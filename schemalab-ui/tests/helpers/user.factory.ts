// Generates new valid user details
export type TestUser = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export function createTestUser(): TestUser {
    const id = Date.now();
    const random = Math.random().toString(36).slice(2);

    return {
        email: `testuser_${id}_${random}@surrey.ac.uk`,
        password: `Password123!`,
        first_name: `Test${random}`,
        last_name: `User${random}`, 
    }
}

export function malformPassword(user: TestUser): TestUser {
    const newPassword = user.password + "malform";

    return {
        email: user.email,
        password: newPassword,
        first_name: user.first_name,
        last_name: user.last_name, 
    }
}