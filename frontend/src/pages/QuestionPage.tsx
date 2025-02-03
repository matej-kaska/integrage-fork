import Button from "components/buttons/Button";
import Footer from "components/footer/Footer";
import Loading from "components/loading/Loading";
import Navbar from "components/navbar/Navbar";
import Navigation from "components/question/Navigation";
import ProgressBar from "components/question/ProgressBar";
import Question from "components/question/Question";
import { websiteUrl } from "consts/SEOConsts";
import useSurvey from "logic/useSurvey";
import { useLayoutEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "redux/store";
import axiosRequest from "utils/axios";
import useWindowSize from "utils/useWindowSize";

const QuestionPage = () => {
	const { survey, activeQuestionIndex, updateQuestion, topic, surveyAttempt, retryable } = useSurvey();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const windowSize = useWindowSize();
	const [questionSetSize, setQuestionSetSize] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const navigate = useNavigate();
	const { t } = useTranslation();
	
	useLayoutEffect(() => {
		if (!survey || survey.length === 0) return;
		let widthOffset = 450;
		let newQuestionSetSize = 0;
		for (let i = 2; i < survey.length + 4; i++) {
			if (survey.length <= i) {
				newQuestionSetSize = i;
				break;
			};
			if (windowSize[0] > widthOffset) {
				widthOffset += 70;
			} else {
				newQuestionSetSize = i;
				break;
			};
		}
		if (newQuestionSetSize < 10) newQuestionSetSize = newQuestionSetSize + 2; 
		setQuestionSetSize(newQuestionSetSize);
	}, [windowSize, survey]);

	useLayoutEffect(() => {
		if (survey.length > 0) setLoading(false);
	}, [survey]);

	const handleSaveClose = async (complete = false) => {
		const editedSurvey = JSON.parse(JSON.stringify(survey));
		for (const question of editedSurvey) {
			if ((question as QuestionOCA).oca_options) {
				(question as QuestionOCA).oca_options = undefined;
			}
			if ((question as QuestionMCA).mca_options) {
				(question as QuestionMCA).mca_options = undefined;
			}
			if ((question as QuestionDND).dnd_options) {
				(question as QuestionDND).dnd_options = undefined;
			}
			if ((question as QuestionASG).asg_options && (question as QuestionASG).asg_questions) {
				(question as QuestionASG).asg_options = undefined;
				(question as QuestionASG).asg_questions = undefined;
			}
			if (question.sub_topic) {
				question.sub_topic = undefined;
			}
			question.text = undefined;
		}
		if (retryable && userInfo.id && editedSurvey.user === 0) {
			editedSurvey.user = userInfo.id;
		}
		if (complete) {
			await axiosRequest("POST", "/api/survey/submit", { updated_at: new Date(), survey_attempt: surveyAttempt, survey: survey, complete: true });
			localStorage.removeItem(`survey-${topic?.pk}`);
			navigate(`/result?id=${surveyAttempt}`);
		} else {
			await axiosRequest("POST", "/api/survey/submit", { updated_at: new Date(), survey_attempt: surveyAttempt, survey: survey });
			navigate("/");
		}
	};

	return (
		<>
			<Helmet>
				<title>IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
				<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
				<link rel="canonical" href={`${websiteUrl}/questionnaire`} />
			</Helmet>
			<Navbar />
			<main className="question-page">
				{loading ? 
					<Loading/>
				:
					<div className="question-wrapper">
						<h3 className="topic">{topic?.name || ""}</h3>
						<ProgressBar active={activeQuestionIndex} survey={survey} questionSetSize={questionSetSize} />
						<p className="sub-topic">
							<span>{`${t("QUESTION.TOPIC")}: `}</span>
							{survey?.[activeQuestionIndex]?.sub_topic?.name}
						</p>
						<div className="question-blob">
							<Question question={survey[activeQuestionIndex]} activeQuestion={activeQuestionIndex} updateQuestion={updateQuestion} />
							<Navigation survey={survey} active={activeQuestionIndex} handleSaveClose={handleSaveClose} />
						</div>
						<Button onClick={() => handleSaveClose()} className="save-button" color="reverse-accent">
							{t("QUESTION.SAVE_EXIT")}
						</Button>
					</div>
				}
			</main>
			<Footer />
		</>
	);
};

export default QuestionPage;
