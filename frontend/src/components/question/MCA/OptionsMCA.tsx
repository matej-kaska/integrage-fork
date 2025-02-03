import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type OptionsMCAProps = {
	question: QuestionMCA;
	updateQuestion: (questionId: number, answer: number | number[] | string) => void;
};

const OptionsMCA = ({ question, updateQuestion }: OptionsMCAProps) => {
	const { t } = useTranslation();
	const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
	const [firstLoad, setFirstLoad] = useState<boolean>(true);

	useLayoutEffect(() => {
		if (question.answered) {
			setSelectedOptions(question.answered);
		}
	}, [question]);

	useLayoutEffect(() => {
		if (selectedOptions.length === 0 && firstLoad) {
			setFirstLoad(false);
			return;
		}
		if (JSON.stringify(question.answered) === JSON.stringify(selectedOptions)) return;
		updateQuestion(question.id, selectedOptions);
	}, [selectedOptions]);

	const updateSelectedOption = (optionId: number) => {
		if (selectedOptions.includes(optionId)) {
			setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
		} else {
			if (optionId === 0) {
				setSelectedOptions([0]);
				return;
			}
			const newSelectedOptions = selectedOptions.filter((id) => id !== 0);
			setSelectedOptions([...newSelectedOptions, optionId]);
		}
	};

	return (
		<ul className="options-mca">
			{question.mca_options?.map((option) => (
				<li key={option.id} className="option">
					<input type="checkbox" name="option" id={`option-${option.id}`} checked={selectedOptions.includes(option.id)} onChange={() => updateSelectedOption(option.id)} />
					<label htmlFor={`option-${option.id}`}>{option.text}</label>
				</li>
			))}
			{question.can_be_none && (
				<li className="option">
					<input type="checkbox" name="option" id={"option-none"} checked={selectedOptions.length === 1 && selectedOptions[0] === 0} onChange={() => updateSelectedOption(0)} />
					<label htmlFor={"option-none"}>{t("QUESTION.NONE_OF_THE_ABOVE")}</label>
				</li>
			)}
		</ul>
	);
};

export default OptionsMCA;
