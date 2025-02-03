import Footer from "components/footer/Footer";
import Loading from "components/loading/Loading";
import Navbar from "components/navbar/Navbar";
import Topic from "components/topic/Topic";
import { websiteUrl } from "consts/SEOConsts";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useLayoutEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "redux/store";
import axiosRequest from "utils/axios";

type TopicSelectResponse = {
	topics: Topic[];
	survey_attempts: SurveyAttempt[];
};

const TopicSelectPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { openErrorSnackbar } = useSnackbar();
	const [topics, setTopics] = useState<Topic[]>([]);
	const [surveyAttempts, setSurveyAttempts] = useState<SurveyAttempt[]>([]);
	const language = useSelector((state: RootState) => state.language);
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const [firstLoad, setFirstLoad] = useState<boolean>(true);

	useLayoutEffect(() => {
		if (!userInfo.id) {
			navigate("/");
			return;
		}
		getTopics();
	}, []);

	useEffect(() => {
		if (firstLoad) {
			setFirstLoad(false);
			return;
		}
		getTopics();
	}, [language]);

	const getTopics = async () => {
		const response = await axiosRequest<TopicSelectResponse>("GET", "/api/survey/topics");
		if (!response.success) {
			openErrorSnackbar(t("SNACKBAR.ERROR"));
			console.error(response);
			return;
		}
		setTopics(response.data.topics.sort((a, b) => a.id - b.id));
		for (const topic of response.data.topics) {
			const savedSurvey = localStorage.getItem(`survey-${topic.id}`);
			if (!savedSurvey) continue;
			const parsedSurvey = JSON.parse(savedSurvey);
			const invalidAttempt = await removeInvalidAttempt(parsedSurvey.survey_attempt, topic.id);
			if (invalidAttempt) continue;
			if (userInfo.id === parsedSurvey.user || parsedSurvey.user === 0) {
				if (!response.data.survey_attempts) response.data.survey_attempts = [];
				const newAttempt = {
					id: parsedSurvey.survey_attempt,
					topic: topic.id,
					created_at: parsedSurvey.created_at,
					completed: false,
					updated_at: parsedSurvey.updated_at,
					retryable: false,
					fetched: false,
				};
				if (parsedSurvey.user === 0) newAttempt.retryable = true;
				response.data.survey_attempts.push(newAttempt);
			}
		}
		if (!response.data.survey_attempts) return;
		setSurveyAttempts(response.data.survey_attempts);
	};

	const removeInvalidAttempt = async (survey_attempt: string, topic_id: number) => {
		const response = await axiosRequest("POST", "/api/survey/attempt/validate", { survey_attempt: survey_attempt });
		if (!response.success) {
			openErrorSnackbar(t("SNACKBAR.ERROR"));
			console.error(response);
			return false;
		}
		if (response.status === 204) {
			localStorage.removeItem(`survey-${topic_id}`);
			return true;
		}
		return false;
	};

	return (
		<>
			<Helmet>
				<title>Topics - IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
				<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
				<link rel="canonical" href={`${websiteUrl}/topic-select`} />
			</Helmet>
			<Navbar />
			<p className="w-full text-center mt-6 text-4xl text-red-600 font-bold">{t("TOPIC_SELECT.FILL_ALL")}</p>
			{topics.length === 0 ?
				<main className="topic-select-page-loading">
					<Loading />
				</main>
			:
				<main className="topic-select-page">
					{topics.map((topic) => (
						<Topic key={topic.id} {...topic} surveyAttempts={surveyAttempts} />
					))}
				</main>
			}
			<Footer />
		</>
	);
};

export default TopicSelectPage;
