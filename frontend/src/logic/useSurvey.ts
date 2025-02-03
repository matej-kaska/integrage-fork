import { useSnackbar } from "contexts/SnackbarProvider";
import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RootState } from "redux/store";
import axiosRequest from "utils/axios";

type SurveyResponse = {
	questions: Question[];
	survey_attempt: string;
	topic: Topic;
	user?: number;
	updated_at?: Date;
	language?: string;
};

type Topic = {
	pk: number;
	name: string;
};

type ChangeLanguageResponse = {
	questions: Question[];
	topic: string;
};

export default () => {
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const language = useSelector((state: RootState) => state.language);
	const [topic, setTopic] = useState<Topic | null>(null);
	const [surveyAttempt, setSurveyAttempt] = useState<string | null>(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const [survey, setSurvey] = useState<Question[]>([]);
	const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
	const [languageLoadded, setLanguageLoaded] = useState<boolean>(false);
	const [retryable, setRetryable] = useState<boolean>(false);
	const [languageChanged, setLanguageChanged] = useState<boolean>(false);
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { openErrorSnackbar } = useSnackbar();

	useLayoutEffect(() => {
		if (survey.length === 0) {
			loadSurvey();
			return;
		}
		nextQuestion();
	}, [searchParams]);

	useEffect(() => {
		if (survey.length === 0) return;
		const newSurvey = {
			questions: survey,
			topic: topic,
			survey_attempt: surveyAttempt,
			user: 0,
			updated_at: new Date(),
			language: language.language
		};
		if (userInfo.id) {
			newSurvey.user = userInfo.id;
		}
		localStorage.setItem(`survey-${searchParams.get("topic-id")}`, JSON.stringify(newSurvey));
	}, [survey]);

	useEffect(() => {
		setLanguageLoaded(true);
		if (languageLoadded) updateLanguageOfQuestions();
	}, [language]);

	useEffect(() => {
		if (languageChanged) {
			setLanguageChanged(false);
			updateLanguageOfQuestions();
		}
	}, [languageChanged]);

	const loadSurvey = async () => {
		if (searchParams.get("retry") === "1") {
			setRetryable(true);
			generateQuestions();
			return;
		}
		const loadedSurvey = await getQuestions();
		const savedSurvey = localStorage.getItem(`survey-${searchParams.get("topic-id")}`);
		if (!savedSurvey && !loadedSurvey) {
			generateQuestions();
			return;
		}
		if (!savedSurvey && loadedSurvey) {
			formatSurvey(loadedSurvey);
			return;
		}
		if (!savedSurvey) return;
		const parsedSurvey = JSON.parse(savedSurvey);
		const invalidAttempt = await removeInvalidAttempt(parsedSurvey.survey_attempt, parsedSurvey.topic.pk);
		if (invalidAttempt) return;
		if (parsedSurvey.user === userInfo.id || parsedSurvey.user === 0) {
			if (loadedSurvey?.updated_at && parsedSurvey.updated_at && loadedSurvey.updated_at > parsedSurvey.updated_at) {
				formatSurvey(loadedSurvey);
				return;
			}
			if (loadedSurvey && parsedSurvey && parsedSurvey.user === 0) {
				formatSurvey(loadedSurvey);
				return;
			}
			if (parsedSurvey) {
				if (parsedSurvey.language !== language.language) {
					setLanguageChanged(true);
				}
				formatSurvey(parsedSurvey);
				return;
			}
			if (parsedSurvey.language !== language.language) {
				setLanguageChanged(true);
			}
			getInheritedQuestions(parsedSurvey);
		} else {
			generateQuestions();
		}
	};

	const getQuestions = async () => {
		const topicId = Number.parseInt(searchParams.get("topic-id") || "0");
		const response = await axiosRequest<SurveyResponse>("POST", "/api/survey/get", { topic: topicId });
		if (!response.success) {
			if (response.status === 500) navigate("/topic-select");
			return;
		}
		return response.data;
	};

	const getInheritedQuestions = async (survey: SurveyResponse) => {
		const response = await axiosRequest<SurveyResponse>("POST", "/api/survey/get", { survey_attempt: survey.survey_attempt });
		if (!response.success) {
			localStorage.removeItem(`survey-${searchParams.get("topic-id")}`);
			generateQuestions();
			return;
		}
		if (response.data.updated_at && survey.updated_at && response.data.updated_at > survey.updated_at) {
			formatSurvey(response.data);
		} else {
			if (userInfo.id && survey.user === 0 && searchParams.get("retry") !== "1") survey.user = userInfo.id;
			formatSurvey(survey);
		}
	};

	const generateQuestions = async () => {
		const response = await axiosRequest<SurveyResponse>("POST", "/api/survey/generate", { topic: Number.parseInt(searchParams.get("topic-id") || "0") });
		if (!response.success) {
			console.error(response.message.en);
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			navigate("/topic-select");
			return;
		}
		formatNewSurvey(response.data);
	};

	const formatSurvey = (survey: SurveyResponse) => {
		if (survey.questions[0].started_at === null) survey.questions[0].started_at = new Date();
		for (const question of survey.questions) {
			if (question.started_at !== null) question.started_at = new Date(question.started_at);
		}
		setSurvey(survey.questions);
		setTopic(survey.topic);
		setSurveyAttempt(survey.survey_attempt);
		const questionId = Number.parseInt(searchParams.get("question-id") || "0");
		const questionIndex = survey.questions.findIndex((question) => question.id === questionId);
		if (questionId === 0 || questionIndex === -1) {
			const parsedActiveQuestion =
				survey.questions.find((question: Question) => {
					if (question.type === "OCA" && (question.answered === 0 || question.answered === null)) return question.id;
					if (question.type === "MCA" && question.answered?.length === 0) return question.id;
					if (question.type === "TXT" && (question.answered === "" || question.answered === null)) return question.id;
					if (question.type === "DND" && question.answered?.length === 0) return question.id;
					if (question.type === "SCL" && (question.answered === 0 || question.answered === null)) return question.id;
					if (question.type === "ASG") {
						if (question.answered) {
							const asg_values = Object.values(question.answered);
							if (asg_values.length === 0) return question.id;
						}
					}
				})?.id || survey.questions[0].id;
			const parsedquestionIndex = survey.questions.findIndex((question) => question.id === parsedActiveQuestion);
			setActiveQuestionIndex(parsedquestionIndex);
			searchParams.set("question-id", String(parsedActiveQuestion));
			setSearchParams(searchParams, { replace: true });
		} else {
			setActiveQuestionIndex(questionIndex);
		}
	};

	const formatNewSurvey = (response: SurveyResponse) => {
		for (const question of response.questions) {
			if (question.type === "OCA") question.answered = 0;
			if (question.type === "MCA") question.answered = [];
			if (question.type === "TXT") {
				question.answered = "";
				question.pasted = false;
			}
			if (question.type === "DND") question.answered = [];
			if (question.type === "SCL") question.answered = 0;
			if (question.type === "ASG" && question.asg_questions) {
				const answered: { [key: number]: number | undefined } = {};
				for (const asg_question of question.asg_questions) {
					const asg_question_id = asg_question.id;
					answered[asg_question_id] = 0;
				}
				question.answered = answered;
			}
			question.started_at = null;
			question.updated_at = [];
		}
		response.questions[0].started_at = new Date();
		setSurveyAttempt(response.survey_attempt);
		setTopic(response.topic);
		setSurvey(response.questions);
		if (searchParams.get("retry") !== "1") {
			response.user = userInfo.id || 0;
		}
		response.updated_at = new Date();
		response.language = language.language;
		localStorage.setItem(`survey-${response.topic.pk}`, JSON.stringify(response));

		const newQuestionId = String(response.questions[0].id);
		searchParams.set("question-id", newQuestionId);
		setSearchParams(searchParams, { replace: true });
	};

	const nextQuestion = () => {
		const questionId = Number.parseInt(searchParams.get("question-id") || "0", 10);
		const questionIndex = survey.findIndex((question) => question.id === questionId);
		if (questionIndex === -1) return;

		if (activeQuestionIndex !== questionIndex) {
			setActiveQuestionIndex(questionIndex);
		}
		
		if (survey[questionIndex].started_at === null) {
			const newSurvey = [...survey];
			newSurvey[questionIndex].started_at = new Date();
			setSurvey(newSurvey);
		}


	};

	const updateQuestion = (questionId: number, answer: number | number[] | string | { [key: number]: number | undefined }, pasted?: boolean) => {
		const newSurvey = [...survey];
		const question = newSurvey.find((q) => q.id === questionId);
		if (!question) return;
		if (question.type === "OCA" && typeof answer === "number") {
			question.answered = answer;
		}
		if (question.type === "MCA" && Array.isArray(answer)) {
			question.answered = answer;
		}
		if (question.type === "TXT" && typeof answer === "string") {
			question.answered = answer;
			question.updated_at = [new Date()];
			question.pasted = pasted;
		}
		if (question.type === "DND" && Array.isArray(answer)) {
			question.answered = answer;
		}
		if (question.type === "SCL" && typeof answer === "number") {
			question.answered = answer;
		}
		if (question.type === "ASG" && typeof answer === "object") {
			question.answered = answer;
		}
		if (question.updated_at.length >= 99) {
			question.updated_at.shift();
		}
		question.updated_at.push(new Date());
		setSurvey(newSurvey);
	};

	const updateLanguageOfQuestions = async () => {
		const response = await axiosRequest<ChangeLanguageResponse>("POST", "/api/survey/change-language", { survey_attempt: surveyAttempt });
		if (!response.success) {
			console.error("Error while changing language of questions");
			console.error(response);
			return;
		}
		const newSurvey = [...survey];
		for (const question of newSurvey) {
			const newQuestion = response.data.questions.find((q) => q.id === question.id);
			if (!newQuestion) continue;
			question.text = newQuestion.text;
			question.sub_topic = newQuestion.sub_topic;
			if (newQuestion.images) question.images = newQuestion.images;
			if (newQuestion.type === "OCA" && "oca_options" in question) {
				question.oca_options = newQuestion.oca_options;
			} else if (newQuestion.type === "MCA" && "mca_options" in question) {
				question.mca_options = newQuestion.mca_options;
			} else if (newQuestion.type === "DND" && "dnd_options" in question) {
				question.dnd_options = newQuestion.dnd_options;
			} else if (newQuestion.type === "ASG" && "asg_options" in question && "asg_questions" in question) {
				question.asg_options = newQuestion.asg_options;
				question.asg_questions = newQuestion.asg_questions;
			} else if (newQuestion.type === "SCL" && "scl_options" in question) {
				question.scl_options = newQuestion.scl_options;
			}
		}
		setTopic((prev) => {
			if (prev === null) {
				return {
					pk: 0,
					name: response.data.topic,
				};
			}
			return { ...prev, name: response.data.topic };
		});
		setSurvey(newSurvey);
	};

	const removeInvalidAttempt = async (survey_attempt: string, topic_id: number) => {
		const response = await axiosRequest("POST", "/api/survey/attempt/validate", { survey_attempt: survey_attempt });
		if (!response.success) {
			return false;
		}
		if (response.status === 204) {
			localStorage.removeItem(`survey-${topic_id}`);
			generateQuestions();
			return true;
		}
		return false;
	};

	return {
		survey,
		activeQuestionIndex,
		updateQuestion,
		topic,
		surveyAttempt,
		retryable,
	};
};
