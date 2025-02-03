import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
	checkIsLoggedIn: (isLoggedIn: boolean) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
	children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const navigate = useNavigate();

	const checkIsLoggedIn = (isLoggedIn: boolean) => {
		if (isLoggedIn) return;
		navigate("/login");
		console.warn("You must be logged in to perform this action!");
	};

	const contextValue = {
		checkIsLoggedIn,
	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const currentContext = useContext(AuthContext);

	if (!currentContext) {
		throw new Error("useAuth must be used within AuthProvider");
	}

	return currentContext;
};
