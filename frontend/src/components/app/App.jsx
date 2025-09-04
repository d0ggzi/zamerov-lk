import {Routes, Route} from "react-router-dom";
import LoginPage from "../pages/auth/login-page/LoginPage.jsx";
import DashboardPage from "../pages/dashboard-page/DashboardPage.jsx";
import RegisterPage from "../pages/auth/register-page/RegisterPage.jsx";
import ProtectedRoute from "../../components/protected-route/ProtectedRoute.jsx";
import RequestCreatePage from "../pages/request/request-create-page/RequestCreatePage.jsx";
import RequestEditPage from "../pages/request/request-edit-page/RequestEditPage.jsx";
import PageWrapper from "../layout/page-wrapper/PageWrapper.jsx";
import RequestsPage from "../pages/request/requests-page/RequestsPage.jsx";
import ServicesPage from "../pages/service/services-page/ServicesPage.jsx";
import ServiceCreatePage from "../pages/service/service-create-page/ServiceCreatePage.jsx";
import OrderPage from "../pages/order/order-page/OrderPage.jsx";
import OrderEditPage from "../pages/order/order-edit-page/OrderEditPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route element={<ProtectedRoute><PageWrapper/></ProtectedRoute>}>
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
                        <ProtectedRoute>
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
                        <ProtectedRoute>
                            <RequestEditPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/services"
                    element={
                        <ProtectedRoute>
                            <ServicesPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/services/new"
                    element={
                        <ProtectedRoute requiredRoles={["manager", "admin"]}>
                            <ServiceCreatePage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <OrderPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders/edit/:id"
                    element={
                        <ProtectedRoute>
                            <OrderEditPage/>
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="*" element={<p className="text-center p-10">Страница не найдена</p>}/>
        </Routes>
    );
}