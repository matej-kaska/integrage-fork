import DropdownPopover from "components/dropdown-popover/DropdownPopover";
import useTransRegister from "consts/useTransRegister";
import countries from "i18n-iso-countries";
import bgLocale from "i18n-iso-countries/langs/bg.json";
import csLocale from "i18n-iso-countries/langs/cs.json";
import deLocale from "i18n-iso-countries/langs/de.json";
import enLocale from "i18n-iso-countries/langs/en.json";
import hrLocale from "i18n-iso-countries/langs/hr.json";
import huLocale from "i18n-iso-countries/langs/hu.json";
import skLocale from "i18n-iso-countries/langs/sk.json";
import slLocale from "i18n-iso-countries/langs/sl.json";
import srLocale from "i18n-iso-countries/langs/sr.json";
import bsLocale from "i18n-iso-countries/langs/bs.json";
import Arrow from "images/arrow.svg?react";
import { type SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { filterCountry } from "utils/filterCountry";
import { timeout } from "utils/timeout";

type LocaleData = {
	locale: string;
	countries: { [key: string]: string | string[] };
};

type Locales = {
	en: LocaleData;
	cs: LocaleData;
	de: LocaleData;
	sk: LocaleData;
	sl: LocaleData;
	hu: LocaleData;
	hr: LocaleData;
	bg: LocaleData;
	sr: LocaleData;
	bs: LocaleData;
};

type CountryDropdownProps = {
	location: string;
	setLocation: React.Dispatch<SetStateAction<string>>;
	error: boolean;
	noLocation?: boolean;
};

const CountryDropdown = ({ location, setLocation, error, noLocation = false }: CountryDropdownProps) => {
	const { t, i18n } = useTranslation();
	const [countryList, setCountryList] = useState<{ code: string; name: string | undefined }[]>([]);
	const [filteredCountryList, setFilteredCountryList] = useState<{ code: string; name: string | undefined }[]>([]);
	const [hoverSelectPanel, setHoverSelectPanel] = useState<boolean>(false);
	const [hoverSelectButton, setHoverSelectButton] = useState<boolean>(false);
	const [search, setSearch] = useState<string>("");
	const [highlightIndex, setHighlightIndex] = useState<number>(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const [panelOpen, setPanelOpen] = useState<boolean>(false);
	const { europeanCountryCodes } = useTransRegister();

	const locales: Locales = {
		en: enLocale,
		cs: csLocale,
		de: deLocale,
		sk: skLocale,
		sl: slLocale,
		hu: huLocale,
		hr: hrLocale,
		bg: bgLocale,
		sr: srLocale,
		bs: bsLocale,
	};

	useLayoutEffect(() => {
		const loadLocale = async () => {
			const lang = i18n.language as keyof Locales;
			const locale = locales[lang] || locales.en;
			countries.registerLocale(locale);
			updateCountriesList();
		};

		const updateCountriesList = () => {
			const countryCodes = Object.keys(countries.getAlpha2Codes());

			const list = countryCodes
				.filter((code) => europeanCountryCodes.includes(code))
				.map((code) => ({
					code,
					name: countries.getName(code, i18n.language),
				}))
				.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
			setCountryList(list);
			setFilteredCountryList(list);
		};

		loadLocale();
	}, [i18n.language]);

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

	const handleLocationChange = async (country: string) => {
		setLocation(country);
		setHoverSelectButton(false);
		setHoverSelectPanel(false);
	};

	useEffect(() => {
		const selectedCountryElement = document.querySelector(".selected-country");

		if (selectedCountryElement) {
			selectedCountryElement.addEventListener("click", eventLinstenersPanel, true);
		}

		return () => {
			if (selectedCountryElement) {
				selectedCountryElement.removeEventListener("click", eventLinstenersPanel, true);
			}
		};
	}, []);

	const eventLinstenersPanel = async () => {
		await timeout(10);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleFilterChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setHighlightIndex(0);
		const result = await filterCountry(event.target.value, countryList);
		if (result.length === 0) {
			setFilteredCountryList(countryList);
			return;
		}
		setFilteredCountryList(result);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			if (highlightIndex === filteredCountryList.length - 1) return;
			setHighlightIndex((prevIndex) => prevIndex + 1);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			if (highlightIndex === 0) return;
			setHighlightIndex((prevIndex) => prevIndex - 1);
		} else if (event.key === "Enter" && highlightIndex !== -1 && inputRef.current) {
			setHighlightIndex(0);
			handleLocationChange(filteredCountryList[highlightIndex].code);
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
	}, [highlightIndex, filteredCountryList]);

	useEffect(() => {
		const callback = (mutationsList: MutationRecord[], _: MutationObserver) => {
			for (const mutation of mutationsList) {
				if (mutation.type === "childList") {
					const panel = document.querySelector(".panel");
					if (panel && inputRef.current && !panelOpen) {
						inputRef.current.focus();
						setHoverSelectPanel(true);
						setPanelOpen(true);
					} else if (panelOpen && !panel) {
						buttonRef.current?.focus();
						setPanelOpen(false);
						setHoverSelectButton(false);
						setHoverSelectPanel(false);
					}
				}
			}
		};

		const observer = new MutationObserver(callback);
		const config = { attributes: false, childList: true, subtree: true };
		observer.observe(document.body, config);

		return () => observer.disconnect();
	}, [panelOpen]);

	return (
		<DropdownPopover
			buttonRef={buttonRef}
			className={"country-dropdown"}
			buttonClassName={`selected-country ${location ? "" : "unselected"} ${error ? "border-red-600" : ""} ${hoverSelectPanel || hoverSelectButton || document.activeElement === inputRef.current ? "hover" : ""}`}
			buttonChildren={
				<>
					{location ? (
						<div className="selected-country-wrapper">
							<ReactCountryFlag
								countryCode={location}
								svg
								style={{
									width: "2em",
									height: "2em",
								}}
								title={location}
							/>
							{countryList.find((country) => country.code === location)?.name}
						</div>
					) : (
						<span>{t("REGISTER.COUNTRY")}</span>
					)}
					<Arrow className="arrow -rotate-90" />
				</>
			}
			panelClassName={`panel ${document.activeElement === inputRef.current ? "hover" : ""}`}
			panelChildren={({ close }) => (
				<>
					<input type="text" placeholder="Filter countries" onChange={handleFilterChange} value={search} ref={inputRef} autoCorrect="false" />
					<ul className="country-list scrollbar" ref={listRef}>
						{noLocation && (
							<li
								className={`${location === "" ? "selected" : ""}`}
								onClick={() => {
									handleLocationChange("");
									close();
								}}
							>
								{t("EXPORT.NO_LOCATION")}
							</li>
						)
						}
						{filteredCountryList.map((country, index) => {
							return (
								<li
									key={country.code}
									className={`${index === highlightIndex ? "hover" : ""} ${location === country.code ? "selected" : ""}`}
									onClick={() => {
										handleLocationChange(country.code);
										close();
									}}
								>
									<ReactCountryFlag
										countryCode={country.code}
										svg
										style={{
											width: "2em",
											height: "2em",
										}}
										title={country.code}
									/>
									{country.name}
								</li>
							);
						})}
					</ul>
				</>
			)}
		/>
	);
};

export default CountryDropdown;
