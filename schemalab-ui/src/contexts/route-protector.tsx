import { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from 'antd';
import { GET, Services } from "../utils/communication";

export const RouteProtector = () => {
    const { user } = useAuth();
    // const [validating, setValidating] = useState(true);
    // const [valid, setValid] = useState(false);

    // useEffect(() => {
    //     const validateToken = async () => {
    //         if (!user?.access) {
    //             setValid(false);
    //             setValidating(false);
    //             return;
    //         }

    //         // Check the token with auth service
    //         try {
    //             await GET(Services.AUTH, "/me");
    //             // if incorrect try will catch as error hopefully
    //             setValid(true);
    //         } catch (error) {
    //             logout();
    //             setValid(false);
    //         } finally {
    //             setValidating(false);
    //         }
    //     }

    //     validateToken();
    // }, [user?.access, logout]);

    // if (validating) {
    //     return <Spin fullscreen />;
    // }

    // if (!valid || !user) {
    //     return <Navigate to="/login" replace />
    // }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}