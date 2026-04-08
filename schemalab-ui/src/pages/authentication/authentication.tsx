import { NavBar } from "./nav-bar";
import { Login } from "./login";
import { Register } from "./sign-up";
import { Routes, Route, useLocation } from "react-router-dom";
import { GuestRouter } from "../../contexts/guest-router";
import { ResetTrigger } from "./resetTrigger";

type steps = "login" | "register";

export function Authentication() {
    const location = useLocation();

    return (
        <>
            <NavBar />

            <Routes location={location}>
                <Route element={<GuestRouter />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="reset" element={<ResetTrigger />} />
                </Route>
            </Routes >
        </>
    );
}