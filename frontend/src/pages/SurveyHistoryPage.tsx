import Button from "components/buttons/Button";
import Footer from "components/footer/Footer";
import Navbar from "components/navbar/Navbar";
import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosRequest from "utils/axios";
import Arrow from "images/arrow.svg?react";
import ResultTopic from "components/result-topic/ResultTopic";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "redux/store";
import Loading from "components/loading/Loading";
import { useSnackbar } from "contexts/SnackbarProvider";
import { Helmet } from "react-helmet-async";
import { websiteUrl } from "consts/SEOConsts";

type SurveyHistoryResponse = {
	results: SmallSurveyAttempt[];
};

const SurveyHistoryPage = () => {
	const language = useSelector((state: RootState) => state.language.language);
	const [surveyHistory, setSurveyHistory] = useState<SmallSurveyAttempt[]>([]);
	const [topics, setTopics] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [languageLoadded, setLanguageLoaded] = useState<boolean>(false);
	const [languageChanged, setLanguageChanged] = useState<boolean>(false);
	const { t } = useTranslation();
	const { openErrorSnackbar } = useSnackbar();

	useLayoutEffect(() => {
		getSurveyHistory();
	}, []);

	useEffect(() => {
		setLanguageLoaded(true);
		if (languageLoadded) getSurveyHistory();
	}, [language]);

	useEffect(() => {
		if (languageChanged) {
			setLanguageChanged(false);
			getSurveyHistory();
		}
	}, [languageChanged]);

	const getSurveyHistory = async () => {
		const response = await axiosRequest<SurveyHistoryResponse>("GET", "/api/survey/attempts");
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			return;
		}
		setLoading(false);
		setSurveyHistory(response.data.results);
		setTopics([...new Set(response.data.results.map((survey) => survey.topic.name))]);
	};

	return (
		<>
			<Helmet>
				<title>IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
				<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
				<link rel="canonical" href={`${websiteUrl}/history`} />
			</Helmet>
			<Navbar />
			<main className="survey-history-page">
				<h2>{t("HISTORY.COMPLETED_SURVEYS")}</h2>
				{loading ?
					<Loading/>
				:
					<>
					{surveyHistory.length === 0 ?
						<span className="no-results">{t("HISTORY.NO_SURVEYS")}</span>
					:
						<>
							<div className="last-result-wrapper">
								<h3>{t("HISTORY.LAST")}</h3>
								<div className="last-result">
									<div className="last">
										<span className="topic">{surveyHistory[0].topic.name}</span>
										<span className="date">{new Date(surveyHistory[0].updated_at).toLocaleDateString("cs-CZ", {hour: '2-digit',minute: '2-digit'})}</span>
									</div>
									<Link to={`/result?id=${surveyHistory[0].id}`} title="Result"><Button><Arrow/></Button></Link>
								</div>
							</div>
							<ul className="topics-result-wrapper">
								{topics.map((topic) => 
									<ResultTopic topic={topic} key={topic} surveyHistory={surveyHistory.filter((survey) => survey.topic.name === topic)} />
								)}
							</ul>
						</>
					}
					</>
				}
			</main>
			<Footer />
		</>
	);
};

export default SurveyHistoryPage;