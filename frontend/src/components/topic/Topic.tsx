import Button from "components/buttons/Button";
import Tooltip from "components/tooltip/Tooltip";
import NotDone from "images/close.svg?react";
import Done from "images/done.svg?react";
import Info from "images/info.svg?react";
import Retry from "images/retry.svg?react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { RootState } from "redux/store";

type TopicProps = {
	surveyAttempts: SurveyAttempt[];
};

const Topic = ({ id, name, description, surveyAttempts }: Topic & TopicProps) => {
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const navigate = useNavigate();
	const { t } = useTranslation();

	const startSurvey = async (id: number, retry?: boolean) => {
		if (retry) {
			navigate(`/questionnaire?retry=1&question-id=0&topic-id=${id.toString()}`);
		} else {
			navigate(`/questionnaire?question-id=0&topic-id=${id.toString()}`);
		}
	};

	const completedAttempt = surveyAttempts.length > 0 ? surveyAttempts.find((attempt) => attempt.topic === id && attempt.completed) : null;
	const inProgressAttempt = surveyAttempts.length > 0 ? surveyAttempts.find((attempt) => attempt.topic === id && !attempt.completed) : null;
	const retryableAttempt = surveyAttempts.length > 0 ? surveyAttempts.find((attempt) => attempt.topic === id && !attempt.completed && !attempt.fetched && attempt.retryable) : null;
	const fetchedInProggressAttempt = surveyAttempts.length > 0 ? surveyAttempts.find((attempt) => attempt.topic === id && !attempt.completed && attempt.fetched) : null;

	const formatDate = (dateString: Date) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("cs-CZ", {hour: '2-digit',minute: '2-digit'}); 
	};

	return (
		<div className="topic-wrapper">
			<h3>{name}</h3>
			<p>{description}</p>
			<div className="full-progress-wrapper">
				<div className="progress-wrapper">
					{completedAttempt ? (
						<>
							<div className="status">
								<Done className={"done"} />
								<span>{t("TOPIC_SELECT.DONE")}</span>
							</div>
							<span>
								{t("TOPIC_SELECT.LAST_COMPLETED")}: {formatDate(completedAttempt.updated_at)}
							</span>
							<Link title="Result" to={`/result?id=${completedAttempt.id}`} className="show-result"><span>{t("TOPIC_SELECT.RESULTS")}</span></Link>
						</>
					) : userInfo.id && (
						<div className="status">
								<NotDone className={"not-done"} />
								<span>{t("TOPIC_SELECT.NOT_DONE")}</span>
							</div>
					)}
					{inProgressAttempt && !completedAttempt && (
						<span className="in-progress">
							<Info />
							{t("TOPIC_SELECT.IN_PROGRESS")}
						</span>
					)}
				</div>
				{inProgressAttempt && completedAttempt && (
					<span className="in-progress bot">
						<Info />
						{t("TOPIC_SELECT.IN_PROGRESS")}
					</span>
				)}
			</div>
			<div className="buttons-wrapper">
				{retryableAttempt && !fetchedInProggressAttempt && userInfo.id && <div className="retry-filler" />}
				<Button color="primary" onClick={() => startSurvey(id)} className={"main-button"}>
					{inProgressAttempt ? t("TOPIC_SELECT.CONTINUE") : completedAttempt ? t("TOPIC_SELECT.FILL_SURVEY_AGAIN") : t("TOPIC_SELECT.FILL_SURVEY")}
				</Button>
				{retryableAttempt && !fetchedInProggressAttempt && userInfo.id && (
					<div className="retry-wrapper">
						<Button color="accent" className="retry" onClick={() => startSurvey(id, true)}>
							<Retry />
						</Button>
						<Tooltip text={t("TOPIC_SELECT.RETRY_INFO")} className="tooltip">
							<Info />
						</Tooltip>
					</div>
				)}
			</div>
		</div>
	);
};

export default Topic;
