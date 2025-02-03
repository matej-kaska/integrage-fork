import Button from "components/buttons/Button";
import Arrow from "images/arrow.svg?react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

type NavigationProps = {
	survey: Question[];
	active: number;
	handleSaveClose: (complete: boolean) => void;
};

const Navigation = ({ survey, active, handleSaveClose }: NavigationProps) => {
	const [availableBack, setAvailableBack] = useState<boolean>(false);
	const [availableNext, setAvailableNext] = useState<boolean>(true);
	const [availableComplete, setAvailableComplete] = useState<boolean>(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();

	useEffect(() => {
		if (survey.length === 0) return;
		setAvailableBack(active > 0);
		setAvailableNext(active < survey.length - 1);
	}, [active]);

	useEffect(() => {
		if (active !== survey.length - 1) return;
		for (const question of survey) {
			if ((question.type === "OCA" || question.type === "SCL") && question.answered === 0) {
				setAvailableComplete(false);
				return;
			}
			if ((question.type === "MCA" || question.type === "DND") && question.answered?.length === 0) {
				setAvailableComplete(false);
				return;
			}
			if (question.type === "TXT" && question.answered === "") {
				setAvailableComplete(false);
				return;
			}
			if (question.type === "ASG" && question.answered) {
				for (const key in question.answered) {
					if (question.answered[key] === undefined || question.answered[key] === 0) {
						setAvailableComplete(false);
						return;
					}
				}
			}
		}
		setAvailableComplete(true);
	}, [survey, active]);

	const back = () => {
		searchParams.set("question-id", survey[active - 1].id.toString());
		setSearchParams(searchParams, { replace: true });
	};

	const next = () => {
		searchParams.set("question-id", survey[active + 1].id.toString());
		setSearchParams(searchParams, { replace: true });
	};

	return (
		<footer className="navigation">
			<Button onClick={back} disabled={!availableBack} className={`${!availableBack ? "disabled" : ""}`}>
				<Arrow className="arrow h-4" />
				<span className="mt-0.5">{t("QUESTION.BACK")}</span>
			</Button>
			{availableComplete ? (
				<Button onClick={() => handleSaveClose(true)} disabled={!availableComplete} className={`${!availableComplete ? "disabled" : ""}`}>
					<span className="mt-0.5">{t("QUESTION.COMPLETE")}</span>
					<Arrow className="arrow rotate-180 h-4" />
				</Button>
			) : (
				<Button onClick={next} disabled={!availableNext} className={`${!availableNext ? "disabled last" : ""}`}>
					<span className="mt-0.5">{availableNext ? t("QUESTION.NEXT") : t("QUESTION.NOT_COMPLETED")}</span>
					{availableNext && <Arrow className="arrow rotate-180 h-4" />}
				</Button>
			)}
		</footer>
	);
};

export default Navigation;
