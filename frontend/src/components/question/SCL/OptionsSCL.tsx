import { useLayoutEffect, useState } from "react";

type OptionsSCLProps = {
	question: QuestionSCL;
	updateQuestion: (questionId: number, answer: number | number[] | string) => void;
};

const OptionsSCL = ({ question, updateQuestion }: OptionsSCLProps) => {
	const [selectedOption, setSelectedOption] = useState<number>(0);
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);

	useLayoutEffect(() => {
		if (question.answered) {
			setSelectedOption(question.answered);
			setSelectedIndex(question.scl_options?.findIndex((option) => option.id === question.answered) || -1);
		} else {
			setSelectedOption(0);
			setSelectedIndex(-1);
		}
	}, [question]);

	useLayoutEffect(() => {
		if (selectedOption === 0) return;
		if (selectedOption === question.answered) return;
		updateQuestion(question.id, selectedOption);
	}, [selectedOption]);

	return (
		<ul className="options-scl">
			{question.scl_options?.sort((a,b) => a.point - b.point).map((option, index) => (
				<li key={option.id} className={`option ${selectedIndex > index ? "checked" : ""}`}>
					{(question.scl_options && selectedOption === 0 && (index === 0 || index === question.scl_options.length - 1)) && 
						<label htmlFor={`option-${option.id}`} className="option-visible">{option.text}</label>
					}
					{option.id === selectedOption &&
						<label htmlFor={`option-${option.id}`} className="option-visible">{option.text}</label>
					}
					<label htmlFor={`option-${option.id}`} className="option-tip">{option.text}</label>
					<input
						data-index={index}
						type="radio"
						name="option"
						id={`option-${option.id}`}
						checked={selectedOption === option.id}
						onChange={() => {setSelectedIndex(index); setSelectedOption(option.id)}}
						className={`${selectedIndex > index ? "checked" : ""}`}
					/>
				</li>
			))}
		</ul>
	);
};

export default OptionsSCL;
