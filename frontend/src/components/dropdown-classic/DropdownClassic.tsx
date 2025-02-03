import DropdownPopover from "components/dropdown-popover/DropdownPopover";
import Arrow from "images/arrow.svg?react";
import { type SetStateAction, useEffect, useRef, useState } from "react";
import { timeout } from "utils/timeout";

type DropdownClassicProps = {
	options: string[];
	selectedOption: string;
	setSelectedOption: React.Dispatch<SetStateAction<string>>;
	defaultText: string;
};

const DropdownClassic = ({ options, selectedOption, setSelectedOption, defaultText }: DropdownClassicProps) => {
	const [highlightIndex, setHighlightIndex] = useState<number>(0);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const [panelOpen, setPanelOpen] = useState<boolean>(false);

	useEffect(() => {
		setHighlightIndex(0);
	}, [panelOpen]);

	useEffect(() => {
		if (listRef.current) {
			const highlightedItem = listRef.current.querySelector("li.hover");

			if (highlightedItem) {
				highlightedItem.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "start",
				});
			}
		}
	}, [highlightIndex]);

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			if (highlightIndex === Object.keys(options).length - 1) return;
			setHighlightIndex((prevIndex) => prevIndex + 1);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			if (highlightIndex === 0) return;
			setHighlightIndex((prevIndex) => prevIndex - 1);
		} else if (event.key === "Enter" && highlightIndex !== -1 && listRef.current) {
			const hoveredItem = document.querySelector("li.hover") as HTMLElement | null;
			if (hoveredItem) hoveredItem.click();
			event.preventDefault();
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [highlightIndex, options, setHighlightIndex]);

	useEffect(() => {
		const callback = async (mutationsList: MutationRecord[], _: MutationObserver) => {
			for (const mutation of mutationsList) {
				if (mutation.type === "childList") {
					const panel = document.querySelector(".panel");
					if (panel && !panelOpen && listRef.current) {
						await timeout(50);
						listRef.current.focus();
						setPanelOpen(true);
					} else if (panelOpen && !panel) {
						const allPanels = document.querySelectorAll(".panel");
						if (allPanels.length === 0) buttonRef.current?.focus();
						setPanelOpen(false);
						setHighlightIndex(0);
					}
				}
			}
		};

		const observer = new MutationObserver(callback);
		const config = { attributes: false, childList: true, subtree: true };
		observer.observe(document.body, config);

		return () => observer.disconnect();
	}, [panelOpen, setHighlightIndex]);

	return (
		<DropdownPopover
			buttonRef={buttonRef}
			className={"dropdown-classic"}
			buttonClassName={`selected-option ${panelOpen ? "open" : ""} ${!selectedOption ? "no-select" : ""}`}
			buttonChildren={
				<>
					{selectedOption ? (
						<div className="selected-option-wrapper">{selectedOption}</div>
					) : (
						<span>{defaultText}</span>
					)}
					<Arrow className="arrow -rotate-90" />
				</>
			}
			panelClassName={"panel"}
			panelChildren={({ close }) => (
				<>
					<ul className="options-list scrollbar" ref={listRef} tabIndex={0}>
						{options.map((value, index) => {
							return (
								<li
									key={index}
									className={`${index === highlightIndex ? "hover" : ""}
										${selectedOption === value ? "selected" : ""}`}
									onClick={() => {
										setSelectedOption(value);
										close();
									}}
								>
									{value}
								</li>
							);
						})}
					</ul>
				</>
			)}
		/>
	);
};

export default DropdownClassic;
