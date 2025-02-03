import Button from "components/buttons/Button";
import { useState } from "react";

const InputAdder = () => {
	const [input, setInput] = useState<string>("");
	const [strings, setStrings] = useState<string[]>([]);

	const addString = () => {
		setStrings([...strings, input]);
		setInput("");
	};

	return (
		<div className="mt-2 flex justify-center items-center flex-col">
			<div className="flex justify-center items-center gap-2">
				<input
					type="text"
					className="border border-black px-4 py-0.5 mr-1"
					placeholder="Add a string..."
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
					}}
				/>
				<Button onClick={addString}>Add +</Button>
				<Button onClick={() => setStrings([])}>Reset</Button>
			</div>
			<div className="flex flex-col">
				{strings.map((string, index) => {
					return <p key={index}>{string}</p>;
				})}
			</div>
		</div>
	);
};

export default InputAdder;
