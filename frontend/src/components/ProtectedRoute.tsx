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
					message: "You must be logged in to access this page",
					from: location.pathname,
				}}
			/>
		);
	}

	return <Outlet />;
}

export default ProtectedRoute;