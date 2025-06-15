import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user-context";
import {useAuth} from "../../context/useAuth.jsx";

function ProtectedRoute({children, requiredRoles = []}) {
    const [token] = useContext(UserContext);
    const { hasRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login', { replace: true });
        } else if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
            navigate('/unauthorized', { replace: true }); // или другая страница с отказом в доступе
        }
    }, [navigate, token, hasRole, requiredRoles]);

    return token ? children : null;
}

export default ProtectedRoute