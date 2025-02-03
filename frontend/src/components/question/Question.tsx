import Options from "./Options";

type QuestionProps = {
	question: Question;
	activeQuestion: number;
	updateQuestion: (questionId: number, answer: number | number[] | string | { [key: number]: number | undefined }) => void;
};

const Question = ({ question, activeQuestion, updateQuestion }: QuestionProps) => {
	return (
		<div className="question">
			<div className="wrapper">
				<div className="left">
					<span className="question-number">{activeQuestion + 1}.</span>
				</div>
				<div className="right">
					<span className="question-text">{question?.text}</span>
					<div className="question-images">{question?.images && question.images.length > 0 && question.images.map((image, index) => <img key={index} src={image} alt="Question" className="image" />)}</div>
					<Options question={question} updateQuestion={updateQuestion} />
				</div>
			</div>
		</div>
	);
};

export default Question;
