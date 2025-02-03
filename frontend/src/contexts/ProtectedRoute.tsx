import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeUser } from "../redux/authSlice";
import type { RootState } from "../redux/store";

type ProtectedRouteProps = {
	allowedRoles?: string[];
	userIsNeeded?: boolean;
	redirectLoggedUser?: boolean;
	children: JSX.Element;
	userIsStaff?: boolean;
};

const ProtectedRoute = ({ allowedRoles, userIsNeeded = false, redirectLoggedUser = false, children, userIsStaff = false }: ProtectedRouteProps) => {
	const dispatch = useDispatch();
	const nativNavigate = useNavigate();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);

	const adjustFontSize = () => {
		const scaleFactor = window.devicePixelRatio;

		if (scaleFactor >= 1.25) {
			document.documentElement.style.fontSize = "100%";
		} else {
			document.documentElement.style.fontSize = "100%";
		}
	};

	useEffect(() => {
		const fullScreenPages = ["/login", "/register", "/reset-password", "/reset-password"];
		const path = `/${window.location.pathname.split("/")[1]}`;
		if (fullScreenPages.includes(path)) {
			adjustFontSize();
		} else {
			document.documentElement.style.fontSize = "100%";
		}
	}, [children]);

	useEffect(() => {
		if (redirectLoggedUser) {
			nativNavigate("/");
			return;
		}

		if (userIsNeeded && (!userInfo.id || (allowedRoles && userInfo.role && !allowedRoles.includes(userInfo.role)))) {
			dispatch(removeUser());
			nativNavigate("/");
		}

		if (userIsNeeded && !userInfo.id) {
			dispatch(removeUser());
			nativNavigate("/");
			console.warn("You must be logged in to perform this action!");
		}
	}, [userInfo, userIsNeeded, allowedRoles, redirectLoggedUser, dispatch]);

	// Check if the current route requires a user
	if (!userIsNeeded) {
		return children;
	}

	// If a user is required, check if there is a user logged in (userInfo._id is not undefined)
	// And if allowedRoles is defined, check if the logged-in user's role is included in allowedRoles
	/*   if (userInfo._id && (!allowedRoles || (userInfo.role && allowedRoles.includes(userInfo.role)))) {
      return children
    } */

	if (userIsStaff && userInfo.id) {
		return children;
	}
	if (userIsStaff) {
		nativNavigate("/");
		return;
	}

	if (userInfo.id) {
		return children;
	}

	// Wait for useEffect to do its work
	return null;
};

export default ProtectedRoute;
