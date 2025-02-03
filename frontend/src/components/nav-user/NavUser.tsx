import Dropdown from "components/dropdown/Dropdown";
import { useSnackbar } from "contexts/SnackbarProvider";
import Logout from "images/logout.svg?react";
import User from "images/user.svg?react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "redux/authSlice";
import { type RootState, store } from "redux/store";
import { clearAxiosAuthorization } from "utils/axios";

const NavUser = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { openInfoSnackbar } = useSnackbar();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);

	const handleLogout = () => {
		navigate("/");
		store.dispatch(removeUser());
		clearAxiosAuthorization();
		openInfoSnackbar(t("SNACKBAR.LOGOUT"));
	};

	return (
		<Dropdown className="nav-user" svg={<User />} noArrow defaultClasses={false} menuClasses="user-menu" ariaLabel={"user"}>
			<Dropdown.Item className={"name"}>
				{userInfo.first_name} {userInfo.last_name}
			</Dropdown.Item>
			<Dropdown.Item>
				<Link to={"/profile"} title="Profile">{t("NAVBAR.DETAILS")}</Link>
			</Dropdown.Item>
			<Dropdown.Item>
				<Link to={"/history"} title="History">{t("NAVBAR.SURVEYS")}</Link>
			</Dropdown.Item>
			{userInfo.is_staff &&
				<Dropdown.Item>
					<Link to={"/export"} title="Export">CSV Export</Link>
				</Dropdown.Item>
			}
			<Dropdown.Item className={"logout"} onClick={handleLogout}>
				{t("NAVBAR.LOGOUT")}
				<Logout />
			</Dropdown.Item>
		</Dropdown>
	);
};

export default NavUser;
