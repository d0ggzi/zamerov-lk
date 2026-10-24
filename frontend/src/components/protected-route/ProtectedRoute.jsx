import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user-context";
import {useAuth} from "../../context/useAuth.jsx";

// Стабильная ссылка: дефолтный `[]` создавал бы новый массив на каждый рендер,
// из-за чего менялись зависимости эффекта и он срабатывал вхолостую.
const NO_ROLES = [];

function ProtectedRoute({children, requiredRoles = NO_ROLES}) {
    const [token] = useContext(UserContext);
    const { hasRole } = useAuth();
    const navigate = useNavigate();

    const authorized = !!token && (requiredRoles.length === 0 || hasRole(requiredRoles));

    useEffect(() => {
        if (!token) {
            navigate('/login', { replace: true });
        } else if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
            navigate('/unauthorized', { replace: true });
        }
    }, [navigate, token, hasRole, requiredRoles]);

    // Не показываем защищённое содержимое неавторизованному пользователю
    // (иначе оно мелькает до срабатывания редиректа в эффекте).
    return authorized ? children : null;
}

export default ProtectedRoute