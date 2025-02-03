import DropdownPopover from "components/dropdown-popover/DropdownPopover";
import Arrow from "images/arrow.svg?react";
import type { RegisterForm } from "pages/RegisterPage";
import { type SetStateAction, useEffect, useRef, useState } from "react";
import type { UseFormClearErrors, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { timeout } from "utils/timeout";
import { capitalizeFirstLetter } from "utils/utils";

type RegisterDropdownsProps = {
	options: { [key: string]: string };
	setValue: UseFormSetValue<any>;
	getValues: UseFormGetValues<any>;
	type: keyof RegisterForm;
	multiple: boolean;
	error: boolean;
	defaultText: string;
	multipleSelected?: string[];
	setMultipleSelected?: React.Dispatch<SetStateAction<string[]>>;
	clearErrors: UseFormClearErrors<any>;
};

const RegisterDropdowns = ({ options, setValue, getValues, type, multiple, error, defaultText, multipleSelected, setMultipleSelected, clearErrors }: RegisterDropdownsProps) => {
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

	const handleOptionChange = async (option: string) => {
		if (multiple) {
			if (multipleSelected?.includes(option)) {
				setMultipleSelected?.(multipleSelected.filter((selected) => selected !== option));
			} else {
				setMultipleSelected?.([...(multipleSelected || []), option]);
			}
		} else {
			if (option === "yes") {
				setValue(type, true);
				clearErrors(type);
				return;
			}
			if (option === "no") {
				setValue(type, false);
				clearErrors(type);
				return;
			}
			setValue(type, option);
			clearErrors(type);
		}
	};

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
			if (!multiple) setHighlightIndex(0);
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
					const panel = document.querySelector(`.panel.${type}`);
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

	const isChecked = (option: string) => {
		if (multiple) {
			return multipleSelected?.includes(option);
		}
		const vals = getValues(type);
		return Array.isArray(vals) ? vals.includes(option) : false;
	};

	return (
		<DropdownPopover
			buttonRef={buttonRef}
			className={"register-dropdown"}
			buttonClassName={`selected-option ${multiple ? (multipleSelected && multipleSelected.length > 0 ? "" : "unselected") : getValues(type) !== undefined ? "" : "unselected"} ${error ? "border-red-600" : ""} ${panelOpen ? "open" : ""}`}
			buttonChildren={
				<>
					{getValues(type) !== undefined ? (
						multiple ? (
							<div className="selected-option-wrapper">
								{multipleSelected?.length ? (
									multipleSelected.map((selected, index) => (
										<span key={index}>
											{options[selected]}
											{index !== multipleSelected.length - 1 ? ", " : ""}
										</span>
									))
								) : (
									<span>{defaultText}</span>
								)}
							</div>
						) : (
							<div className="selected-option-wrapper">{type === "employment" ? (getValues(type) ? capitalizeFirstLetter(options.yes) : capitalizeFirstLetter(options.no)) : Object.entries(options).find(([key]) => key === getValues(type))?.[1]}</div>
						)
					) : (
						<span>{defaultText}</span>
					)}
					<Arrow className="arrow -rotate-90" />
				</>
			}
			panelClassName={`panel ${type}`}
			panelChildren={({ close }) => (
				<>
					<ul className="options-list scrollbar" ref={listRef} tabIndex={0}>
						{Object.entries(options).map(([key, value], index) => {
							return (
								<li
									key={index}
									className={`${index === highlightIndex ? "hover" : ""} ${
										multiple ? (multipleSelected?.includes(key) ? "selected" : "") : getValues(type) === key ? "selected" : type === "employment" ? (key === "yes" ? (getValues(type) ? "selected" : "") : key === "no" ? (!getValues(type) ? "selected" : "") : "") : ""
									}`}
									onClick={() => {
										handleOptionChange(key);
										!multiple && close();
									}}
								>
									{multiple ? (
										<>
											<input type="checkbox" tabIndex={-1} checked={isChecked(key)} id={`input${key}`} onChange={() => handleOptionChange(key)} readOnly />
											<label htmlFor={`input${key}`}>{value}</label>
										</>
									) : (
										<>{type !== "employment" ? value : capitalizeFirstLetter(value)}</>
									)}
								</li>
							);
						})}
					</ul>
				</>
			)}
		/>
	);
};

export default RegisterDropdowns;
