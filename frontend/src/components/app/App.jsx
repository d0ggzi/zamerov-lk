import {Routes, Route} from "react-router-dom";
import LoginPage from "../pages/login-page/LoginPage.jsx";
import DashboardPage from "../pages/dashboard-page/DashboardPage.jsx";
import RegisterPage from "../pages/register-page/RegisterPage.jsx";
import ProtectedRoute from "../../components/protected-route/ProtectedRoute.jsx";
import RequestCreatePage from "../pages/request-create-page/RequestCreatePage.jsx";
import RequestEditPage from "../pages/request-edit-page/RequestEditPage.jsx";
import PageWrapper from "../layout/page-wrapper/PageWrapper.jsx";
import RequestsPage from "../pages/requests-page/RequestsPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route element={<PageWrapper/>}>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/requests"
                    element={
                        <ProtectedRoute requiredRoles={["manager", "admin"]}>
                            <RequestsPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/requests/new"
                    element={
                        <ProtectedRoute requiredRoles={["manager", "admin"]}>
                            <RequestCreatePage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/requests/edit/:id"
                    element={
                        <ProtectedRoute requiredRoles={["manager", "admin"]}>
                            <RequestEditPage/>
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="*" element={<p className="text-center p-10">Страница не найдена</p>}/>
        </Routes>
    );
}