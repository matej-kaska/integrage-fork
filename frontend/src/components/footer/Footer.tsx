import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
	const { t } = useTranslation();

	return (
		<footer className="footer">
			{t("FOOTER.INFORMATION")}&nbsp;<Link to={"/gdpr"}>{t("FOOTER.PROTECTION")}</Link>
		</footer>)
};

export default Footer;
