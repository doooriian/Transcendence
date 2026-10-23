import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Chess from "./pages/Chess";
import Friends from "./pages/Friends";
import Legal from "./pages/Legal";
import { ThemeProvider } from "./context/ThemeContext"
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
	return (
		<ThemeProvider>
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/terms-of-service" element={<Legal />} />
						<Route path="/privacy-policy" element={<Legal />} />

						<Route element={<ProtectedRoute />}>
							<Route path="/friends" element={<Friends />} />
							<Route path="/chess" element={<Chess />} />
							<Route path="/profile/:username" element={<Profile />} />
						</Route>

						<Route path="*" element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;