import Button from "components/buttons/Button";
import { useModal } from "contexts/ModalProvider";
import CloseIcon from "images/close.svg?react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const FillSurveyModal = () => {
	const navigate = useNavigate();
	const { closeModal } = useModal();
	const { t } = useTranslation();

	const handleFillWithRegister = () => {
		navigate("/register");
		closeModal();
	};

	const handleFillWithoutRegister = () => {
		navigate("/topic-select");
		closeModal();
	};

	return (
		<section className="fill-survey-modal">
			<div className="top-wrapper">
				<CloseIcon onClick={closeModal} />
			</div>
			<div className="fill-wrapper">
				<div className="fill-register">
					<Button onClick={handleFillWithRegister}>{t("FILL_SURVEY.FILL_REGISTER")}</Button>
					<p>{t("FILL_SURVEY.FILL_REGISTER_DESC")}</p>
				</div>
			</div>
			<div className="fill-without-register">
				<Button disabled onClick={handleFillWithoutRegister} className="without-register" color="reverse-accent">
					{t("FILL_SURVEY.FILL_WITHOUT_REGISTER")}
				</Button>
				<p>{t("FILL_SURVEY.FILL_WITHOUT_REGISTER_DESC")}</p>
			</div>
		</section>
	);
};

export default FillSurveyModal;
