import {Routes, Route} from "react-router-dom";
import LoginPage from "../pages/auth/login-page/LoginPage.jsx";
import DashboardPage from "../pages/dashboard-page/DashboardPage.jsx";
import RegisterPage from "../pages/auth/register-page/RegisterPage.jsx";
import ProtectedRoute from "../../components/protected-route/ProtectedRoute.jsx";
import RequestCreatePage from "../pages/request/request-create-page/RequestCreatePage.jsx";
import RequestEditPage from "../pages/request/request-edit-page/RequestEditPage.jsx";
import RequestDetailPage from "../pages/request/request-detail-page/RequestDetailPage.jsx";
import PageWrapper from "../layout/page-wrapper/PageWrapper.jsx";
import RequestsPage from "../pages/request/requests-page/RequestsPage.jsx";
import ServicesPage from "../pages/service/services-page/ServicesPage.jsx";
import ServiceCreatePage from "../pages/service/service-create-page/ServiceCreatePage.jsx";
import OrderPage from "../pages/order/order-page/OrderPage.jsx";
import OrderEditPage from "../pages/order/order-edit-page/OrderEditPage.jsx";
import OrderDetailPage from "../pages/order/order-detail-page/OrderDetailPage.jsx";
import RequestChatPage from "../pages/request/request-chat-page/RequestChatPage.jsx";
import OrderChatPage from "../pages/order/order-chat-page/OrderChatPage.jsx";
import DocumentsPage from "../pages/documents-page/DocumentsPage.jsx";
import CalendarPage from "../pages/calendar-page/CalendarPage.jsx";
import ChatInboxPage from "../pages/chat-inbox-page/ChatInboxPage.jsx";
import PaymentPage from "../pages/payment-page/PaymentPage.jsx";
import ProfilePage from "../pages/profile-page/ProfilePage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/unauthorized" element={<p className="text-center p-10">Недостаточно прав для доступа к этой странице</p>}/>
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
                    path="/requests/:id"
                    element={
                        <ProtectedRoute>
                            <RequestDetailPage/>
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
                <Route
                    path="/orders/:id"
                    element={
                        <ProtectedRoute>
                            <OrderDetailPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/requests/chat/:id"
                    element={
                        <ProtectedRoute>
                            <RequestChatPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders/chat/:id"
                    element={
                        <ProtectedRoute>
                            <OrderChatPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/documents"
                    element={
                        <ProtectedRoute>
                            <DocumentsPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute>
                            <CalendarPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatInboxPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute>
                            <PaymentPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage/>
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="*" element={<p className="text-center p-10">Страница не найдена</p>}/>
        </Routes>
    );
}