import {useContext, useMemo} from "react";
import {jwtDecode} from "jwt-decode";
import {UserContext} from "./user-context.jsx";

export function useAuth() {
    const [token] = useContext(UserContext);

    const user = useMemo(() => {
        if (!token) return null;
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error("Ошибка декодирования токена:", error);
            return null;
        }
    }, [token]);

    const hasRole = (requiredRoles) => {
        if (!user || !user.role.name) return false;
        return requiredRoles.includes(user.role.name);
    };

    return {user, hasRole, isAuthenticated: !!user};
}
