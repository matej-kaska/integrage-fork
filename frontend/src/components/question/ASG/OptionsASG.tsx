import Dropdown from "components/dropdown/Dropdown";
import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type OptionsASGProps = {
	question: QuestionASG;
	updateQuestion: (questionId: number, answer: number | number[] | string | { [key: number]: number | undefined }) => void;
};

const OptionsASG = ({ question, updateQuestion }: OptionsASGProps) => {
	const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number | undefined }>({});
	const [firstLoad, setFirstLoad] = useState<boolean>(true);
	const { t } = useTranslation();

	useLayoutEffect(() => {
		if (question.answered) {
			setSelectedOptions(question.answered);
		}
	}, [question]);

	useLayoutEffect(() => {
		if (Object.values(selectedOptions).length === 0 && firstLoad) {
			setFirstLoad(false);
			return;
		}
		if (JSON.stringify(question.answered) === JSON.stringify(selectedOptions)) return;
		updateQuestion(question.id, selectedOptions);
	}, [selectedOptions]);

	const updateSelectedOptions = (asg_question_id: number, option_id: number) => {
		setSelectedOptions((prev) => ({
			...prev,
			[asg_question_id]: option_id,
		}));
	};

	const getSelectedOption = (asg_question_id: number) => {
		return question.asg_options?.find((option) => option.id === selectedOptions[asg_question_id])?.text;
	};

	return (
		<section className="options-asg">
			{question.asg_questions?.map((asg_question, index) => (
				<div className="option" key={asg_question.id}>
					<div className="full">
						<div className="left">{index + 1}.</div>
						<div className="right">{asg_question.text}</div>
					</div>
					<Dropdown label={getSelectedOption(asg_question.id) || t("QUESTION.SELECT")} className={`dropdown-button ${getSelectedOption(asg_question.id) ? "" : "unselected"}`} defaultClasses={false}>
						{question.asg_options?.map((option) => (
							<Dropdown.Item key={asg_question.id + option.id} onClick={() => updateSelectedOptions(asg_question.id, option.id)} className={selectedOptions[asg_question.id] === option.id ? "selected" : ""}>
								{option.text}
							</Dropdown.Item>
						))}
					</Dropdown>
				</div>
			))}
		</section>
	);
};

export default OptionsASG;
