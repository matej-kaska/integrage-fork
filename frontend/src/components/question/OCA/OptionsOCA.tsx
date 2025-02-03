import { useLayoutEffect, useState } from "react";

type OptionsOCAProps = {
	question: QuestionOCA;
	updateQuestion: (questionId: number, answer: number | number[] | string) => void;
};

const OptionsOCA = ({ question, updateQuestion }: OptionsOCAProps) => {
	const [selectedOption, setSelectedOption] = useState<number>(0);

	useLayoutEffect(() => {
		if (question.answered) {
			setSelectedOption(question.answered);
		}
	}, [question]);

	useLayoutEffect(() => {
		if (selectedOption === 0) return;
		if (selectedOption === question.answered) return;
		updateQuestion(question.id, selectedOption);
	}, [selectedOption]);

	return (
		<ul className="options-oca">
			{question.oca_options?.map((option) => (
				<li key={option.id} className="option" onClick={() => setSelectedOption(option.id)}>
					<input type="radio" name="option" id={`option-${option.id}`} checked={selectedOption === option.id} onChange={() => setSelectedOption(option.id)} />
					<label htmlFor={`option-${option.id}`}>{option.text}</label>
				</li>
			))}
		</ul>
	);
};

export default OptionsOCA;
