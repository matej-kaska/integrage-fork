import Button from "components/buttons/Button";
import Footer from "components/footer/Footer";
import Loading from "components/loading/Loading";
import Navbar from "components/navbar/Navbar";
import { websiteUrl } from "consts/SEOConsts";
import { useSnackbar } from "contexts/SnackbarProvider";
import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import type { RootState } from "redux/store";
import axiosRequest from "utils/axios";
import { capitalizeFirstLetter } from "utils/utils";

const RadarChart = lazy(() => import("components/radar-chart/RadarChart"));

const SurveyResultPage = () => {
	const language = useSelector((state: RootState) => state.language.language);
	const [surveyResult, setSurveyResult] = useState<SurveyResult[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [searchParams, _] = useSearchParams();
	const [showLastDone, setShowLastDone] = useState<boolean>(false);
	const [languageLoadded, setLanguageLoaded] = useState<boolean>(false);
	const [languageChanged, setLanguageChanged] = useState<boolean>(false);
	const { t } = useTranslation();
	const { openErrorSnackbar } = useSnackbar();

	useEffect(() => {
		setLanguageLoaded(true);
		if (languageLoadded) {
			const id = searchParams.get("id");
			if (id) {
				getSurveyResult(id);
			}
		}
	}, [language]);

	useEffect(() => {
		if (languageChanged) {
			setLanguageChanged(false);
			const id = searchParams.get("id");
			if (id) {
				getSurveyResult(id);
			}
		}
	}, [languageChanged]);

	useEffect(() => {
		setLoaded(true);
		if (!loaded) return;
		const id = searchParams.get("id");
		if (id) {
			getSurveyResult(id);
		}
	}, [searchParams, loaded]);

	const getSurveyResult = async (id: string) => {
		const response = await axiosRequest<SurveyResult[]>("GET", `/api/survey/attempt/${id}`);
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			return;
		}
		setSurveyResult(response.data);
	};

	if (surveyResult.length === 0) {
		return (
			<>
				<Helmet>
					<title>IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
					<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
					<link rel="canonical" href={`${websiteUrl}/result`} />
				</Helmet>
				<Navbar />
				<main className="survey-result-page">
					<h3 className="header">{t("RESULTS.SURVEY_ASSESSMENT")}</h3>
					<Loading />
				</main>
				<Footer />
			</>
		);
	}

	return (
		<>
			<Helmet>
				<title>IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
				<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
				<link rel="canonical" href={`${websiteUrl}/result`} />
			</Helmet>
			<Navbar />
			<main className="survey-result-page">
				<h3 className="header">{t("RESULTS.SURVEY_ASSESSMENT")}</h3>
				<h1>{surveyResult[0].topic.name}</h1>
				<span className="date"><span className="font-bold">{t("RESULTS.DATE_OF_COMPLETION")}: </span>{new Date(surveyResult[0].updated_at).toLocaleDateString("cs-CZ", {hour: '2-digit',minute: '2-digit'})}</span>
				<div className="row">
					<div className="half">
						<Suspense fallback={<Loading />}>
							<RadarChart survey={surveyResult}/>
						</Suspense>
					</div>
					<div className="0p point level0"/>
					<div className="half">
						{surveyResult.length > 1 &&
							<div className="last-done-wrapper">
								<h4 className="last-done">{t("RESULTS.LAST_COMPLETED")}</h4>
								<span>{new Date(surveyResult[1].updated_at).toLocaleDateString("cs-CZ", {hour: '2-digit',minute: '2-digit'})}</span>
								<Button className="last-done-button" onClick={() => setShowLastDone(!showLastDone)}>{showLastDone ? t('RESULTS.HIDE_RESULTS') : t('RESULTS.SHOW_RESULTS')}</Button>
							</div>
						}
					</div>
				</div>
				{surveyResult[0].results.map((result, index) => (
					<div key={index} className="row">
						<div className="half">
							{index % 2 !== 0 ? 
								<Overview result={result} index={index} lastResult={surveyResult[1]?.results[index]} showLastDone={showLastDone}/>
							:
								<div className="filler"/>
							}
						</div>
						<div className={`point ${index+1}p ${index === surveyResult[0].results.length - 1 ? "no-line" : ""} ${`level${index+1}`}`}>{index+1}</div>
						<div className="half">
							{index % 2 === 0 ? 
								<Overview result={result} index={index} lastResult={surveyResult[1]?.results[index]} showLastDone={showLastDone}/>
							:
								<div className="filler"/>
							}
						</div>
					</div>
				))}
			</main>
			<Footer />
		</>
	);
};

export default SurveyResultPage;

const Overview = ({result, index, lastResult, showLastDone}: {result: Result, index: number, lastResult: Result | undefined, showLastDone: boolean}) => {
	const { t } = useTranslation();
	
	return	(
		<div className="overview">
			<h3 className={`${`level${index+1}`}`}>{capitalizeFirstLetter(result.sub_topic.name)}</h3>
			<div className="overview-body">
				<span><span className="font-bold">{t("RESULTS.NUMBER_OF_POINTS")}: </span> {Math.round(result.actual_points * 10) / 10}/{result.total_points}</span>
				{lastResult && showLastDone && <span className="last-result"><span className="font-bold">{t("RESULTS.NUMBER_OF_POINTS")}: </span> {Math.round(result.actual_points * 10) / 10}/{lastResult.total_points}</span>}
				<span><span className="font-bold">{t("RESULTS.LEVEL")}: </span> {result.rating.title}</span>
				{lastResult && showLastDone && <span className="last-result"><span className="font-bold">{t("RESULTS.LEVEL")}: </span> {lastResult.rating.title}</span>}
				<span className="description"><span className="font-bold">{t("RESULTS.RECOMMENDATION")}: </span> {result.rating.description}</span>
			</div>
		</div>
	)
};