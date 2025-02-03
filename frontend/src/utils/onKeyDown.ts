export const onKeyDown = (action: () => void) => (event: React.KeyboardEvent<HTMLDivElement | HTMLButtonElement>) => {
	if (event.key === "Enter" || event.key === " ") {
		action();
	}
};
