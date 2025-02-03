import Fuse from "fuse.js";

export const filterCountry = async (country: string, countryList: { code: string; name: string | undefined }[]) => {
	const normalize = (text: string) => {
		const map: { [key: string]: string } = {
			á: "a",
			č: "c",
			ď: "d",
			é: "e",
			ě: "e",
			í: "i",
			ň: "n",
			ó: "o",
			ř: "r",
			š: "s",
			ť: "t",
			ú: "u",
			ů: "u",
			ý: "y",
			ž: "z",
		};
		return text
			.toLowerCase()
			.split("")
			.map((char) => map[char] || char)
			.join("");
	};

	const getFn = (obj: any, path: string | string[]) => {
		const value = Fuse.config.getFn(obj, path);
		if (typeof value === "string") {
			return normalize(value);
		}
		return value;
	};

	const options = {
		keys: ["name"],
		getFn,
		includeScore: true,
		shouldSort: true,
		findAllMatches: true,
	};

	const fuse = await new Fuse(countryList, options);

	const normalizedcountry = normalize(country.toLowerCase());

	const results = await fuse.search(normalizedcountry);
	if (results.length > 0) {
		return results.map((result) => result.item);
	}

	return [];
};
