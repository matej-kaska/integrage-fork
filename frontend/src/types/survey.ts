type QuestionType = {
	id: number;
	text?: string;
	sub_topic?: SubTopicType;
	started_at: Date | null;
	updated_at: Date[];
	images?: string[];
};

type SubTopicType = {
	id: number;
	name: string;
};

type SCLOneOption = {
	id: number;
	text: string;
	point: number;
};

type QuestionOCA = QuestionType & {
	type: "OCA";
	oca_options?: OptionOCA[];
	answered?: number;
};

type QuestionMCA = QuestionType & {
	type: "MCA";
	mca_options?: OptionMCA[];
	answered?: number[];
	can_be_none?: boolean;
};

type QuestionTXT = QuestionType & {
	type: "TXT";
	answered?: string;
	pasted?: boolean;
};

type QuestionDND = QuestionType & {
	type: "DND";
	dnd_options?: OptionDND[];
	answered?: number[];
};

type QuestionSCL = QuestionType & {
	type: "SCL";
	scl_options?: SCLOneOption[];
	answered?: number;
};

type QuestionASG = QuestionType & {
	type: "ASG";
	asg_options?: OptionASG[];
	asg_questions?: OneQuestionASG[];
	answered?: { [key: number]: number | undefined };
};

type OptionOCA = {
	id: number;
	text: string;
};

type OptionMCA = {
	id: number;
	text: string;
};

type OptionDND = {
	id: number;
	text: string;
};

type OptionASG = {
	id: number;
	text: string;
};

type OneQuestionASG = {
	id: number;
	text: string;
};

type Question = QuestionOCA | QuestionMCA | QuestionTXT | QuestionDND | QuestionSCL | QuestionASG;

type Topic = {
	id: number;
	name: string;
	description: string;
	progress?: TopicProgress;
};

type TopicProgress = {
	started: boolean;
	done: boolean;
	lastUpdated?: Date;
	link?: string;
};

type SurveyAttempt = {
	id: string;
	topic: number;
	created_at: Date;
	completed: boolean;
	updated_at: Date;
	retryable?: boolean;
	fetched?: boolean;
};

type SmallResult = {
	id: number;
	total_points: number;
	actual_points: number;
};

type SmallSurveyAttempt = {
	id: string;
	topic: {
		id: number;
		name: string;
	};
	created_at: Date;
	updated_at: Date;
	results: SmallResult[];
};

type Rating = {
	id: number;
	title: string;
	description: string;
};

type Result = {
	id: number;
	sub_topic: {
		id: number;
		name: string;
	};
	rating: Rating;
	total_points: number;
	actual_points: number;
};

type SurveyResult = {
	id: string;
	topic: {
		id: number;
		name: string;
	};
	created_at: Date;
	updated_at: Date;
	results: Result[];
};