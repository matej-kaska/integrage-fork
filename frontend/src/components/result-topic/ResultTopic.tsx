import { Transition } from "@headlessui/react";
import Arrow from "images/arrow.svg?react";
import { useState } from "react";
import { Link } from "react-router-dom";

type ResultTopicProps = {
	topic: string;
	surveyHistory: SmallSurveyAttempt[];
};

const ResultTopic = ({topic, surveyHistory}: ResultTopicProps) => {
	const [open, setOpen] = useState(false);

	return (
		<li className="result-topic">
			<div className={`header ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
				<h3>{topic}</h3>
				<Arrow className={`arrow-button ${open ? "open" : ""}`}/>
			</div>
			<Transition show={open} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-0" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-0">
				<div className={`results-wrapper ${open ? "open" : ""}`}>
					{surveyHistory.map((survey, index) =>
						<>
							<div key={survey.id} className="result">
								<div className="point"/>
								<Link title="Result" to={`/result?id=${survey.id}`}>{new Date(survey.updated_at).toLocaleDateString("cs-CZ", {hour: '2-digit',minute: '2-digit'})}</Link>
							</div>
							{(index+1) % 4 === 0 && index !== surveyHistory.length && <div className="line"/>}
						</>
					)}
				</div>
			</Transition>
		</li>
	);
};

export default ResultTopic;
