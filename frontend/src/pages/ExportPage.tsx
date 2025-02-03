import axios from "axios";
import Button from "components/buttons/Button";
import DropdownPopover from "components/dropdown-popover/DropdownPopover";
import Footer from "components/footer/Footer";
import Navbar from "components/navbar/Navbar";
import { websiteUrl } from "consts/SEOConsts";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "redux/store";
import axiosRequest from "utils/axios";
import Arrow from "images/arrow.svg?react";
import { languageMap } from "components/language-dropdown/LanguageDropdown";
import DropdownClassic from "components/dropdown-classic/DropdownClassic";
import Loading from "components/loading/Loading";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "contexts/SnackbarProvider";

const CountryDropdown = lazy(() => import('components/country-dropdown/CountryDropdown'));

type TopicResponse = {
	id: number;
	name: string;
};

const ExportPage = () => {
	const { t } = useTranslation();
	const { openErrorSnackbar } = useSnackbar();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const language = useSelector((state: RootState) => state.language.language);
	const navigate = useNavigate();
	const cancelTokenSource = useRef(axios.CancelToken.source());
	const [selectedLanguage, setSelectedLanguage] = useState<string>("");
	const [topics, setTopics] = useState<TopicResponse[]>([]);
	const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
	const [selectedCountry, setSelectedCountry] = useState<string>("");
	const [selectedTimeFrom, setSelectedTimeFrom] = useState<Date | null>(null);
	const [selectedTimeTo, setSelectedTimeTo] = useState<Date | null>(null);
	const [numberOfSurveys, setNumberOfSurveys] = useState<number>(0);
	const [languageLoadded, setLanguageLoaded] = useState<boolean>(false);
	const [loading, setLoading]	= useState<boolean>(false);

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		setLanguageLoaded(true);
		setSelectedLanguage(language);
		if (languageLoadded) loadData();
	}, [language]);

	useEffect(() => {
		if (!selectedTopic) return;
		loadNumberOfSurveys();
		return () => {
			cancelTokenSource.current.cancel("Component unmounted");
		};
	}, [selectedTopic, selectedCountry, selectedTimeFrom, selectedTimeTo]);

	const loadData = async () => {
		const response = await axiosRequest<TopicResponse[]>("GET", "/api/survey/topic/list");
		if (!response.success) {
			const message = t("BACKEND-RESPONSES.An unexpected error occurred");
			openErrorSnackbar(message);
			console.error("Error loading topics:", response.message.cz);
			return;
		}
		setTopics(response.data);
	};

	const loadNumberOfSurveys = async () => {
		cancelTokenSource.current.cancel("New request initiated");
		cancelTokenSource.current = axios.CancelToken.source();
		const isoSelectedTimeFrom = selectedTimeFrom?.toISOString() || "null";
		const isoSelectedTimeTo = selectedTimeTo?.toISOString() || "null";
		
		try {
			const response = await axiosRequest<number>("GET", 
				`/api/export/count?topic=${selectedTopic}&country=${selectedCountry}&time_from=${isoSelectedTimeFrom}&time_to=${isoSelectedTimeTo}`,
				null, {
					cancelToken: cancelTokenSource.current.token,
				}
			);
			if (!response.success) return;
			setNumberOfSurveys(response.data);
		} catch (error) {
			if (axios.isCancel(error)) {
				console.info("Request canceled:", error.message);
			} else {
				console.error("Error loading number of surveys:", error);
			}
    }
	};

	const handleExport = async () => {
		if (!selectedTopic) {
			const message = t("BACKEND-RESPONSES.An unexpected error occurred");
			openErrorSnackbar(message);
			console.error("Please select a topic");
			return;
		}
		setLoading(true);
		const response = await axiosRequest<BlobPart>("POST", "/api/export", {
			language: selectedLanguage,
			topic: selectedTopic,
			country: selectedCountry,
			time_from: selectedTimeFrom?.toISOString(),
			time_to: selectedTimeTo?.toISOString()
		});
		if (!response.success) {
			const message = t("BACKEND-RESPONSES.An unexpected error occurred");
			openErrorSnackbar(message);
			console.error("Error exporting CSV:", response.message.cz);
			setLoading(false);
			return;
		}
		const blob = new Blob([response.data], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "export.csv";
		a.click();
		window.URL.revokeObjectURL(url);
		setLoading(false);
	};

	const getLanguageIcon = () => {
		if (selectedLanguage) {
			return <img alt={selectedLanguage} src={`src/images/flag-${selectedLanguage}.webp`} className="selected-flag" />;
		}
	};

	if (!userInfo || !userInfo.is_staff) {
		navigate("/login");
	}

	return (
		<>
			<Helmet>
				<title>Export - IntegrAGE - Self-Assessment for 55+ Workers+</title>
				<meta name="description" content="Explore our comprehensive guides on using the IntegrAGE self-assessment tool. Tailored for workers aged 55+, learn how to evaluate your tech skills, workplace integration, and well-being." />
				<link rel="canonical" href={`${websiteUrl}/export`} />
			</Helmet>
			<Navbar />
			<main className="export-page">
				<h1>CSV Export</h1>
				<div className="flex flex-col align-middle items-center gap-1">
					<h2>{t("EXPORT.SELECT_LANGUAGE")}:</h2>
					<DropdownPopover
						className={"language-dropdown"}
						buttonClassName={"selected-language"}
						buttonChildren={
							<>
								<>
									{getLanguageIcon()}
									{languageMap[selectedLanguage] || "ENG"}
								</>
								<Arrow className="arrow -rotate-90" />
							</>
						}
						panelClassName={"panel"}
						panelChildren={({close}) => (
							<>
								<ul className="languages-list">
									<li onClick={() => {setSelectedLanguage("en"); close()}}>
										<img alt="en" src={"src/images/flag-en.webp"} />
										ENG
									</li>
									<li onClick={() => {setSelectedLanguage("cs"); close()}}>
										<img alt="cs" src={"src/images/flag-cs.webp"} />
										CZE
									</li>
									<li onClick={() => {setSelectedLanguage("sk"); close()}}>
										<img alt="sk" src={"src/images/flag-sk.webp"} />
										SVK
									</li>
									<li onClick={() => {setSelectedLanguage("de"); close()}}>
										<img alt="de" src={"src/images/flag-de.webp"} />
										DEU
									</li>
									<li onClick={() => {setSelectedLanguage("hu"); close()}}>
										<img alt="hu" src={"src/images/flag-hu.webp"} />
										HUN
									</li>
									<li onClick={() => {setSelectedLanguage("hr"); close()}}>
										<img alt="hr" src={"src/images/flag-hr.webp"} />
										HRV
									</li>
									<li onClick={() => {setSelectedLanguage("bg"); close()}}>
										<img alt="bg" src={"src/images/flag-bg.webp"} />
										BGR
									</li>
									<li onClick={() => {setSelectedLanguage("sl"); close()}}>
										<img alt="sl" src={"src/images/flag-sl.webp"} />
										SVN
									</li>
									<li onClick={() => {setSelectedLanguage("sr"); close()}}>
										<img alt="sr" src={"src/images/flag-sr.webp"} />
										SRB
									</li>
									<li onClick={() => {setSelectedLanguage("bs"); close()}}>
										<img alt="bs" src={"src/images/flag-bs.webp"} />
										BIH
									</li>
								</ul>
							</>
						)}
					/>
				</div>
				<div className="flex flex-col align-middle items-center gap-1">
					<h2>{t("EXPORT.SELECT_TOPIC")}:</h2>
					<DropdownClassic
						options={topics.map((topic) => topic.name)}
						selectedOption={topics.find((topic) => topic.id === selectedTopic)?.name || ""}
						setSelectedOption={(value) => setSelectedTopic(topics.find((topic) => topic.name === value)?.id || null)}
						defaultText={t("EXPORT.SELECT_TOPIC")}
					/>
				</div>
				<div className="flex flex-col align-middle items-center gap-1">
					<h2>{t("EXPORT.SELECT_COUNTRY")}: <span className="optional">({t("EXPORT.OPTIONAL")})</span></h2>
					<Suspense fallback={<Loading />}>
						<CountryDropdown location={selectedCountry} setLocation={setSelectedCountry} error={false} noLocation />
					</Suspense>
				</div>
				<div className="flex flex-col align-middle items-center">
					<h2>{t("EXPORT.SELECT_TIME")}: <span className="optional">({t("EXPORT.OPTIONAL")})</span></h2>
					<div className="flex flex-row align-middle items-center gap-24">
						<div className="flex flex-col align-middle items-center">
							<h3>{t("EXPORT.FROM")}:</h3>
							<input 
								type="date" 
								value={selectedTimeFrom?.toISOString().slice(0, 10) || ""} 								
								onChange={(e) => {
									const newValue = e.target.value;
									if (!newValue) {
										setSelectedTimeFrom(null);
									} else {
										setSelectedTimeFrom(new Date(newValue));
									}
								}}
							/>
						</div>
						<div className="flex flex-col align-middle items-center">
							<h3>{t("EXPORT.TO")}:</h3>
							<input
								type="date"
								value={selectedTimeTo?.toISOString().slice(0, 10) || ""}
								onChange={(e) => {
									const newValue = e.target.value;
									if (!newValue) {
										setSelectedTimeTo(null);
									} else {
										setSelectedTimeTo(new Date(newValue));
									}
								}}
							/>
						</div>
					</div>
				</div>
				<span className="number-of-surveys">
					{t("EXPORT.NUMBER_OF_AVAIABLE")}: {!selectedTopic ? <span className="no-topic">{t("EXPORT.SELECT_TOPIC").toLowerCase()}</span> : numberOfSurveys}
				</span>
				{loading ?
					<Loading upper/>
				:
					<Button color="accent" onClick={handleExport} disabled={!selectedTopic}>
						{t("EXPORT.EXPORT")}
					</Button>
				}
			</main>
			<Footer />
		</>
	);
};

export default ExportPage;
