import FillSurveyModal from "components/fill-survey-modal/FillSurveyModal";
import LanguageDropdown from "components/language-dropdown/LanguageDropdown";
import NavUser from "components/nav-user/NavUser";
import { useModal } from "contexts/ModalProvider";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "images/IntegrAGE-logo.svg?react";
import type { RootState } from "redux/store";

const Navbar = () => {
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const { t } = useTranslation();
	const { showModal } = useModal();

	const handleSurveyClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!userInfo.id) {
			event.preventDefault();
			showModal(<FillSurveyModal />);
		}
	};

	return (
		<nav className="navbar">
			<div className="logo-wrapper">
				<Link to={"/"} title="Homepage">
					<Logo/>
				</Link>
			</div>
			<div className="links-wrapper">
				<ul>
					<li>
						<Link to={"/"} title="Homepage">{t("NAVBAR.HOME")}</Link>
					</li>
					<li>
						<Link to={"/topic-select"} onClick={handleSurveyClick} title="Topic select">
							{t("NAVBAR.SURVEY")}
						</Link>
					</li>
{/* 					<li>
						<Link to={"/guides"} title="Guides">{t("NAVBAR.GUIDES")}</Link>
					</li> */}
				</ul>
				<div className="user-wrapper">
					{userInfo.id ? (
						<NavUser />
					) : (
						<Link to={"/login"} className="button accent medium uppercase" title="login">
							{t("NAVBAR.LOGIN")}
						</Link>
					)}
					<LanguageDropdown />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
