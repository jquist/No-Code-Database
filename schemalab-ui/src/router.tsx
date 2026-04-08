import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { DbDesigner } from "./pages/db-designer/db-designer";
import { ProjectManagement } from "./pages/project-management/project-management";
import { CanvasProvider } from "./contexts/canvas-context"; // Import the provider
import { Authentication } from "./pages/authentication/authentication";
import { LandingPage } from "./pages/landing-page/landing-page";
import { RouteProtector } from "./contexts/route-protector";

export default function Router() {
    return (
        <CanvasProvider> {/* <-- Wrap all routes */}
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/*" element={<Authentication />} />
                        <Route element={<RouteProtector />}>
                            <Route path="/projects" element={<ProjectManagement />} />
                            <Route path="/dev/db-designer/:id" element={<DbDesigner example="" />} /> {/* For existing projects */}
                            <Route path="/dev/db-designer" element={<DbDesigner example="" />} /> {/* For new projects */}
                        </Route>
                        <Route path="/dev/settings" element={<DbDesigner example="" />} /> {/* For new projects */}
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </CanvasProvider>
    );
}