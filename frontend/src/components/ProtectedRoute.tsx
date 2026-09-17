import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
	const { isLoggedIn } = useAuth();
	const location = useLocation();

	if (!isLoggedIn) {
		return (
			<Navigate
				to="/login"
				replace
				state={{
					message: "Vous devez être connecté pour accéder à cette page.",
					from: location.pathname,
				}}
			/>
		);
	}

	return <Outlet />;
}

export default ProtectedRoute;