import QuestionSetArrow from "images/question-set-arrow.svg?react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type ProgressBarProps = {
	survey: Question[];
	active: number;
	questionSetSize: number;
};

const ProgressBar = ({ survey, active, questionSetSize }: ProgressBarProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [currentSet, setCurrentSet] = useState<number>(0);
	const [progressWidth, setProgressWidth] = useState<number>(0);
	const [blockAnimation, setBlockAnimation] = useState<boolean>(false);

	let startIndex = currentSet * questionSetSize;
	startIndex = startIndex + questionSetSize > survey.length ? survey.length - questionSetSize : startIndex;
	if (startIndex < 0) {
		startIndex = 0;
	}
	const endIndex = Math.min(startIndex + questionSetSize, survey.length);

	useLayoutEffect(() => {
		if (questionSetSize === 0 || survey.length === 0) return;
		setProgressWidth(60 * questionSetSize + 56);
		const questionId = Number.parseInt(searchParams.get("question-id") || "0", 10);
		const questionIndex = survey.findIndex((question) => question.id === questionId);
		if (questionIndex === -1) return;
		if (questionIndex < startIndex || questionIndex >= endIndex) {
			setCurrentSet(Math.floor(questionIndex / questionSetSize));
		}
	}, [questionSetSize, searchParams, survey, active]);

	useLayoutEffect(() => {
		setBlockAnimation(true);
	}, [currentSet]);

	useEffect(() => {
		setBlockAnimation(false);
	}, [blockAnimation]);

	const changeQuestion = (index: number) => {
		searchParams.set("question-id", survey[index].id.toString());
		setSearchParams(searchParams, { replace: true });
	};

	const getAnswered = (question: Question) => {
		if (!question.answered) return;
		if (question.type === "OCA") {
			return question.answered !== 0;
		}
		if (question.type === "MCA") {
			return question.answered.length > 0;
		}
		if (question.type === "TXT") {
			return question.answered.length > 0;
		}
		if (question.type === "DND") {
			return question.answered.length > 0;
		}
		if (question.type === "SCL") {
			return question.answered !== 0;
		}
		if (question.type === "ASG") {
			for (const key in question.answered) {
				if (question.answered[key] === undefined || question.answered[key] === 0) {
					return false;
				}
			}
			return true;
		}
	};

	const showPrevSet = () => {
		if ((currentSet + 1) * questionSetSize < survey.length) {
			setCurrentSet(currentSet + 1);
		}
	};

	const showNextSet = () => {
		if (currentSet > 0) {
			setCurrentSet(currentSet - 1);
		}
	};

	return (
		<div className="progress-bar" style={{ width: progressWidth }}>
			<QuestionSetArrow onClick={showNextSet} className={`arrow ${currentSet === 0 ? "disabled" : ""}`} />
			<div className="steps">
				{survey.slice(startIndex, endIndex).map((question, index) => {
					return (
						<div key={question.id} className={`step ${index + startIndex === active ? "active" : ""} ${blockAnimation ? "transition-none" : ""} ${getAnswered(question) ? "answered" : ""}`} onClick={() => changeQuestion(index + startIndex)}>
							{index + 1 + startIndex}
						</div>
					);
				})}
			</div>
			<QuestionSetArrow onClick={showPrevSet} className={`arrow next ${(currentSet + 1) * questionSetSize >= survey.length ? "disabled" : ""}`} />
		</div>
	);
};

export default ProgressBar;
