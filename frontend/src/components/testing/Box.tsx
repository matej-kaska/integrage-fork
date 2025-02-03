import Label from "./Label";

type BoxProps = {
	number: number;
};

const Box = ({ number }: BoxProps) => {
	return (
		<div className="border border-purple-600 p-4">
			<h1>Box</h1>
			<Label number={number} />
		</div>
	);
};

export default Box;
