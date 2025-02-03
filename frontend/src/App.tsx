import Homepage from "pages/HomePage";
import LoginPage from "pages/LoginPage";
import ProfilePage from "pages/ProfilePage";
import QuestionPage from "pages/QuestionPage";
import RegisterPage from "pages/RegisterPage";
import TopicSelectPage from "pages/TopicSelectPage";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { setLanguage } from "redux/languageSlice";
import "./App.scss";
import { AuthProvider } from "./contexts/AuthProvider";
import { ModalProvider } from "./contexts/ModalProvider";
import ProtectedRoute from "./contexts/ProtectedRoute";
import SnackbarProvider from "./contexts/SnackbarProvider";
import Testing from "./pages/Testing";
import { setError } from "./redux/errorSlice";
import { ErrorBoundary } from "./utils/ErrorHandling";
import GuidesPage from "pages/GuidesPage";
import ScrollToTop from "contexts/ScrollToTop";
import SurveyHistoryPage from "pages/SurveyHistoryPage";
import SurveyResultPage from "pages/SurveyResultPage";
import GdprPage from "pages/GdprPage";
import ExportPage from "pages/ExportPage";

const App = () => {
	const dispatch = useDispatch();
	const { i18n } = useTranslation();

	useEffect(() => {
		const updateFontLink = (lang: string) => {
			const head = document.head;
			const linkId = "cir-font-style";
			let link = document.getElementById(linkId) as HTMLLinkElement | null;

			if (lang === "bg" || lang === "sr") {
				if (!link) {
					link = document.createElement("link");
					link.id = linkId;
					link.rel = "stylesheet";
					link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400..800&display=swap";
					head.appendChild(link);
				}
			} else {
				if (link) {
					head.removeChild(link);
				}
			}
		};
		
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			i18n.changeLanguage(storedLanguage);
			dispatch(setLanguage(storedLanguage));
			updateFontLink(storedLanguage);
			document.documentElement.lang = storedLanguage;
		} else {
			const language = navigator.language || navigator.languages[0] || "en";
			const lang = language.split("-")[0];
			if (lang) {
				i18n.changeLanguage(lang);
				dispatch(setLanguage(storedLanguage));
				updateFontLink(lang);
				localStorage.setItem("language", lang);
				document.documentElement.lang = lang;
			}
		}
	}, [dispatch]);

	useEffect(() => {
		// Global error handler for uncaught exceptions
		window.onerror = (message, source, lineno, colno, error) => {
			console.error("App handler: Uncaught Error:", {
				message,
				source,
				lineno,
				colno,
				error,
			});
			dispatch(setError(JSON.stringify({ message, source, lineno, colno, error })));
		};

		// Global handler for unhandled promise rejections
		window.onunhandledrejection = (event) => {
			console.error("App handler: Unhandled Promise Rejection:", event.promise, "Reason:", event.reason);
			dispatch(setError(JSON.stringify({ event })));
		};
	}, []);

	return (
		<ErrorBoundary>
			<BrowserRouter>
				<SnackbarProvider>
					<ModalProvider>
						<AuthProvider>
							<ScrollToTop />
							<Routes>
								<Route
									path="/"
									element={
										<ProtectedRoute>
											<Homepage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/login"
									element={
										<ProtectedRoute>
											<LoginPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/register"
									element={
										<ProtectedRoute>
											<RegisterPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/topic-select"
									element={
										<ProtectedRoute>
											<TopicSelectPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/questionnaire"
									element={
										<ProtectedRoute>
											<QuestionPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/profile"
									element={
										<ProtectedRoute userIsNeeded>
											<ProfilePage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/guides"
									element={
										<ProtectedRoute>
											<GuidesPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/gdpr"
									element={
										<ProtectedRoute>
											<GdprPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/history"
									element={
										<ProtectedRoute userIsNeeded>
											<SurveyHistoryPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/result"
									element={
										<ProtectedRoute>
											<SurveyResultPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/export"
									element={
										<ProtectedRoute userIsNeeded userIsStaff>
											<ExportPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/testing"
									element={
										<ProtectedRoute>
											<Testing />
										</ProtectedRoute>
									}
								/>
							</Routes>
						</AuthProvider>
					</ModalProvider>
				</SnackbarProvider>
			</BrowserRouter>
		</ErrorBoundary>
	);
};

export default App;
