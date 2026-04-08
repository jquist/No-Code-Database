export const passwordConstraintContent: {
    id: number;
    name: string;
    message: string;
}[] = [
    {
        id: 1,
        name: "minLength",
        message: "Password must be atleast 10 characters.",
    },
    {
        id: 2,
        name: "lowerCase",
        message: "Must contain at least one lowercase letter.",
    },
    {
        id: 3,
        name: "upperCase",
        message: "Must contain at least one uppercase letter.",
    },
    {
        id: 4,
        name: "number",
        message: "Must contain at least one number.",
    },
    {
        id: 5,
        name: "special",
        message: "Must contain at least one special character.",
    },
];