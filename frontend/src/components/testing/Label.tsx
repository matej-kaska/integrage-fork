type LabelProps = {
	number: number;
};

const Label = ({ number }: LabelProps) => {
	return (
		<>
			<h2>{number}</h2>
			<p>text</p>
		</>
	);
};

export default Label;
