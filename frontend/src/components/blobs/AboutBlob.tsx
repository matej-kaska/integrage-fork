import { useTranslation } from "react-i18next";
import GoalsBlob from "./floating-blobs/GoalsBlob";
import WhoWeAreBlob from "./floating-blobs/WhoWeAreBlob";

const AboutBlob = () => {
	const { t } = useTranslation();

	return (
		<>
			<section className="about-blob">
				<h2>{t("HOMEPAGE.ABOUT.TITLE")}</h2>
				<div className="left-wrapper">
					<WhoWeAreBlob />
				</div>
				<div className="center-wrapper">
					<GoalsBlob />
				</div>
			</section>
		</>
	);
};

export default AboutBlob;
