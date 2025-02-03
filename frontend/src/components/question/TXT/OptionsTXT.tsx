import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type OptionsTXTProps = {
	question: QuestionTXT;
	updateQuestion: (questionId: number, answer: number | number[] | string, pasted?: boolean) => void;
};

const OptionsTXT = ({ question, updateQuestion }: OptionsTXTProps) => {
	const [answer, setAnswer] = useState<string>("");
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const [isPastedContent, setIsPastedContent] = useState(false);
	const [pastedText, setPastedText] = useState("");
	const { t } = useTranslation();

	useEffect(() => {
		if (question.answered) {
			setAnswer(question.answered);
		}
	}, [question]);

	const updateAnswer = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const answerInput = e.target.value;
		if (answerInput.length > 1024) {
			alert(t("QUESTION.ANSWER-TOO-LONG"));
			return;
		}
		let pastedContent = false;
		if (isPastedContent) {
			pastedContent = checkIfSimilar(e.target.value);
		}
		setAnswer(answerInput);
		updateQuestion(question.id, answerInput, pastedContent);
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const paste = e.clipboardData.getData("text");
		setPastedText(paste);
		setIsPastedContent(true);
	};

	const checkIfSimilar = (current: string) => {
		const currentLength = current.length;
		const minLength = pastedText.length * 0.9;
		const maxLength = pastedText.length * 1.1;

		if (minLength <= currentLength && currentLength <= maxLength) {
			setIsPastedContent(true);
			return true;
		}
		setIsPastedContent(false);
		setPastedText("");
		return false;
	};

	return (
		<div className={`options-txt ${isFocused ? "focused" : ""}`}>
			<textarea className="scrollbar" onChange={updateAnswer} value={answer} placeholder={t("QUESTION.TYPE_HERE")} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} maxLength={1024} onPaste={handlePaste} />
		</div>
	);
};

export default OptionsTXT;
