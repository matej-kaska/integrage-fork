import Button from "components/buttons/Button";
import FillSurveyModal from "components/fill-survey-modal/FillSurveyModal";
import { useModal } from "contexts/ModalProvider";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const HeaderBlob = () => {
	const navigate = useNavigate();
	const userInfo = useSelector((state: any) => state.auth.userInfo);
	const { showModal } = useModal();
	const { t } = useTranslation();

	const handleSurveyClick = () => {
		if (!userInfo.id) {
			showModal(<FillSurveyModal />);
		} else {
			navigate("/topic-select");
		}
	};

	return (
		<>
			<section className="header-blob">
				<div className="wrapper">
					<div className="left-side">
						<div className="text-wrapper">
							<h1>{t("HOMEPAGE.INTRO.TITLE")}</h1>
							<p>{t("HOMEPAGE.INTRO.DESCRIPTION")}</p>
							<Button color={"primary"} onClick={handleSurveyClick}>
								{t("HOMEPAGE.INTRO.TAKE_SURVEY")}
							</Button>
						</div>
					</div>
					<div className="right-side">
						<img src="/images/img-01.webp" alt="header-image" />
					</div>
				</div>
			</section>
		</>
	);
};

export default HeaderBlob;
