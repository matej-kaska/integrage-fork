type EvenOddProps = {
	even: boolean;
};

const EvenOdd = ({ even }: EvenOddProps) => {
	return <>{even ? <h2>Even</h2> : <h2>Odd</h2>}</>;
};

export default EvenOdd;
