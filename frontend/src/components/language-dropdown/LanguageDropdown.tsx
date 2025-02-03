import DropdownPopover from "components/dropdown-popover/DropdownPopover";
import Arrow from "images/arrow.svg?react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setLanguage } from "redux/languageSlice";

export const languageMap: {[key: string]: string} = {
	en: "ENG",
	cs: "CZE",
	de: "DEU",
	sk: "SVK",
	hu: "HUN",
	hr: "HRV",
	bg: "BGR",
	sl: "SVN",
	sr: "SRB",
	bs: "BIH",
};

const LanguageDropdown = () => {
	const { i18n } = useTranslation();
	const dispatch = useDispatch();

	const getLanguage = () => {
		const language = i18n.language;
		return languageMap[language] || "ENG";
	};

	const getLanguageIcon = () => {
		const language = i18n.language;
		if (language) {
			return <img alt={language} src={`src/images/flag-${language}.webp`} className="selected-flag" />;
		}
		return <img alt="en" src={"src/images/flag-en.webp"} className="selected-flag" />;
	};

	const changeLanguage = (lang: string) => {
		i18n.changeLanguage(lang);
		dispatch(setLanguage(lang));
		localStorage.setItem("language", lang);
	};

	return (
		<DropdownPopover
			className={"language-dropdown"}
			buttonClassName={"selected-language"}
			buttonChildren={
				<>
					<>
						{getLanguageIcon()}
						{getLanguage()}
					</>
					<Arrow className="arrow -rotate-90" />
				</>
			}
			panelClassName={"panel"}
			panelChildren={() => (
				<>
					<ul className="languages-list">
						<li onClick={() => changeLanguage("en")}>
							<img alt="en" src={"src/images/flag-en.webp"} />
							ENG
						</li>
						<li onClick={() => changeLanguage("cs")}>
							<img alt="cs" src={"src/images/flag-cs.webp"} />
							CZE
						</li>
						<li onClick={() => changeLanguage("sk")}>
							<img alt="sk" src={"src/images/flag-sk.webp"} />
							SVK
						</li>
						<li onClick={() => changeLanguage("de")}>
							<img alt="de" src={"src/images/flag-de.webp"} />
							DEU
						</li>
						<li onClick={() => changeLanguage("hu")}>
							<img alt="hu" src={"src/images/flag-hu.webp"} />
							HUN
						</li>
						<li onClick={() => changeLanguage("hr")}>
							<img alt="hr" src={"src/images/flag-hr.webp"} />
							HRV
						</li>
						<li onClick={() => changeLanguage("bg")}>
							<img alt="bg" src={"src/images/flag-bg.webp"} />
							BGR
						</li>
						<li onClick={() => changeLanguage("sl")}>
							<img alt="sl" src={"src/images/flag-sl.webp"} />
							SVN
						</li>
						<li onClick={() => changeLanguage("sr")}>
							<img alt="sr" src={"src/images/flag-sr.webp"} />
							SRB
						</li>
						<li onClick={() => changeLanguage("bs")}>
							<img alt="bs" src={"src/images/flag-bs.webp"} />
							BIH
						</li>
					</ul>
				</>
			)}
		/>
	);
};

export default LanguageDropdown;
