import axios, { AxiosPromise } from "axios";
import { loginResult } from '../contexts/auth-context';

interface ApiRequest<T> {
    code: number,
    message: string;
    data: T;
    time: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    errorCode?: string;
    data: T;
    time: string;
}

export enum Services {
    AUTH,
    MANAGEMENT,
    SCHEMA,
}

// NOT type safe, but minor since it should always be set
const SERVICE_BASE_URLS: Record<Services, string> = {
    [Services.AUTH]: process.env.REACT_APP_AUTH_URL!,
    [Services.MANAGEMENT]: process.env.REACT_APP_MANAGEMENT_URL!,
    [Services.SCHEMA]: process.env.REACT_APP_SCHEMA_URL!,
}

function makeRequest<T> (service: Services, method: "get"|"post"|"put"|"patch"|"delete", url?: string, message?: string, data?: unknown): AxiosPromise<ApiResponse<T>> {
        
    const requestBody: ApiRequest<unknown> = {
        code: 200,
        message: message || "Client Request.",
        data,
        time: (new Date().toISOString()),
    };

    // Leave the auth headers to axios interceptors
    
    return axios({
            method,
            baseURL: SERVICE_BASE_URLS[service],
            url,
            data: requestBody,
        }).catch((err) => {
            // Reformat the service response to our format
            const serviceErrorResponse = err.response?.data;

            throw {
                code: serviceErrorResponse?.code || 500,
                message: serviceErrorResponse?.message || err.message,
                errorCode: serviceErrorResponse?.errorCode || "UNKNOWN",
                data: serviceErrorResponse?.data || null,
                time: serviceErrorResponse?.time || new Date().toISOString(),
            } as ApiResponse<T>;
        });
}

export const GET = <T>(service: Services, url?: string) => makeRequest<T>(service, "get", url);

export const POST = <T>(service: Services, url?: string, message?: string, data?: unknown) => makeRequest<T>(service, "post", url, message, data);

export const PUT = <T>(service: Services, url?: string, message?: string, data?: unknown) => makeRequest<T>(service, "put", url, message, data);

export const PATCH = <T>(service: Services, url?: string, message?: string, data?: unknown) => makeRequest<T>(service, "patch", url, message, data);

export const DELETE = <T>(service: Services, url?: string, message?: string, data?: unknown) => makeRequest<T>(service, "delete", url, message, data);

// microservice authentication
// timestamp
// handling errors
// auth headers
// define structure for schema and react flow data

// Axios interceptors. Intercept every request to check user authentication

axios.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user: loginResult = JSON.parse(storedUser);

            if (user.access) {
                config.headers.Authorization = `Bearer ${user.access}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // JWT has expired or is just invalid
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:logout"));
            // WIP: redirect user to login screen
        }

        return Promise.reject(error);
    }
);