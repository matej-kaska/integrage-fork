import { lazy, Suspense } from "react";
import OptionsASG from "./ASG/OptionsASG";
import OptionsMCA from "./MCA/OptionsMCA";
import OptionsOCA from "./OCA/OptionsOCA";
import OptionsSCL from "./SCL/OptionsSCL";
import OptionsTXT from "./TXT/OptionsTXT";
import Loading from "components/loading/Loading";

const OptionsDND = lazy(() => import('./DND/OptionsDND'));

type OptionsProps = {
	question: Question;
	updateQuestion: (questionId: number, answer: number | number[] | string | { [key: number]: number | undefined }) => void;
};

const Options = ({ question, updateQuestion }: OptionsProps) => {
	if (question?.type === "OCA") {
		return <OptionsOCA question={question} updateQuestion={updateQuestion} />;
	}
	if (question?.type === "MCA") {
		return <OptionsMCA question={question} updateQuestion={updateQuestion} />;
	}
	if (question?.type === "TXT") {
		return <OptionsTXT question={question} updateQuestion={updateQuestion} />;
	}
	if (question?.type === "DND") {
		return (
			<Suspense fallback={<Loading />}>
				<OptionsDND question={question} updateQuestion={updateQuestion} />
			</Suspense>
		);
	}
	if (question?.type === "SCL") {
		return <OptionsSCL question={question} updateQuestion={updateQuestion} />;
	}
	if (question?.type === "ASG") {
		return <OptionsASG question={question} updateQuestion={updateQuestion} />;
	}
};

export default Options;
