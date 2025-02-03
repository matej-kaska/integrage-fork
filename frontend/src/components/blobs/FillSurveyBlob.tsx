import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const FillSurveyBlob = () => {
	const { t } = useTranslation();

	return (
		<section className="fill-survey-blob">
			<div className="wrapper">
				<h3>{t("HOMEPAGE.ABOUT.TAKE_SURVEY.TITLE")}</h3>
				<p>{t("HOMEPAGE.ABOUT.TAKE_SURVEY.DESCRIPTION")}</p>
				<Link to={"/register"} title="Register" className="button accent medium uppercase">{t("HOMEPAGE.ABOUT.TAKE_SURVEY.REGISTER")}</Link>
			</div>
		</section>
	);
};

export default FillSurveyBlob;
