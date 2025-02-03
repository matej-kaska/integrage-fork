import { useTranslation } from "react-i18next";

const GoalsBlob = () => {
	const { t } = useTranslation();

	return (
		<section className="goals-blob">
			<div className="left-wrapper">
				<img src="src/images/img-02.webp" alt="goals-image" />
			</div>
			<div className="right-wrapper">
				<h3>{t("HOMEPAGE.ABOUT.OUR_GOAL.TITLE")}</h3>
				<p>{t("HOMEPAGE.ABOUT.OUR_GOAL.DESCRIPTION_1")}</p>
				<p>{t("HOMEPAGE.ABOUT.OUR_GOAL.DESCRIPTION_2")}</p>
			</div>
		</section>
	);
};

export default GoalsBlob;
