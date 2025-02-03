import { useTranslation } from "react-i18next";

const WhoWeAreBlob = () => {
	const { t } = useTranslation();

	return (
		<section className="who-we-are-blob">
			<h3>{t("HOMEPAGE.ABOUT.WHO_WE_ARE.TITLE")}</h3>
			<p>{t("HOMEPAGE.ABOUT.WHO_WE_ARE.DESCRIPTION_1")}</p>
		</section>
	);
};

export default WhoWeAreBlob;
