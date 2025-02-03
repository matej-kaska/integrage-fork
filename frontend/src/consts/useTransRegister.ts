import { useTranslation } from "react-i18next";

export default () => {
	const { t } = useTranslation();

	const europeanCountryCodes = [
		"AL", // Albania
		"AD", // Andorra
		"AT", // Austria
		"BY", // Belarus
		"BE", // Belgium
		"BA", // Bosnia and Herzegovina
		"BG", // Bulgaria
		"HR", // Croatia
		"CY", // Cyprus
		"CZ", // Czech Republic (Czechia)
		"DK", // Denmark
		"EE", // Estonia
		"FI", // Finland
		"FR", // France
		"GE", // Georgia
		"DE", // Germany
		"GR", // Greece
		"HU", // Hungary
		"IS", // Iceland
		"IE", // Ireland
		"IT", // Italy
		"XK", // Kosovo
		"LV", // Latvia
		"LI", // Liechtenstein
		"LT", // Lithuania
		"LU", // Luxembourg
		"MT", // Malta
		"MD", // Moldova
		"MC", // Monaco
		"ME", // Montenegro
		"NL", // Netherlands
		"MK", // North Macedonia (FYROM)
		"NO", // Norway
		"PL", // Poland
		"PT", // Portugal
		"RO", // Romania
		"RU", // Russia
		"SM", // San Marino
		"RS", // Serbia
		"SK", // Slovakia
		"SI", // Slovenia
		"ES", // Spain
		"SE", // Sweden
		"CH", // Switzerland
		"UA", // Ukraine
		"GB", // United Kingdom
		"VA", // Vatican City (Holy See)
	];

	const jobSectors = {
		administration: t("REGISTER.JOB_SECTORS.ADMINISTRATION"),
		agriculture_food_industry: t("REGISTER.JOB_SECTORS.AGRICULTURE_FOOD_INDUSTRY"),
		arts_culture: t("REGISTER.JOB_SECTORS.ARTS_CULTURE"),
		automotive_industry: t("REGISTER.JOB_SECTORS.AUTOMOTIVE_INDUSTRY"),
		banking: t("REGISTER.JOB_SECTORS.BANKING"),
		chemical_industry: t("REGISTER.JOB_SECTORS.CHEMICAL_INDUSTRY"),
		construction_real_estate: t("REGISTER.JOB_SECTORS.CONSTRUCTION_REAL_ESTATE"),
		customer_support: t("REGISTER.JOB_SECTORS.CUSTOMER_SUPPORT"),
		economics_finance_accounting: t("REGISTER.JOB_SECTORS.ECONOMICS_FINANCE_ACCOUNTING"),
		education_science_research: t("REGISTER.JOB_SECTORS.EDUCATION_SCIENCE_RESEARCH"),
		electrical_engineering_energy: t("REGISTER.JOB_SECTORS.ELECTRICAL_ENGINEERING_ENERGY"),
		general_labor: t("REGISTER.JOB_SECTORS.GENERAL_LABOR"),
		healthcare_social_care: t("REGISTER.JOB_SECTORS.HEALTHCARE_SOCIAL_CARE"),
		human_resources: t("REGISTER.JOB_SECTORS.HUMAN_RESOURCES"),
		information_technology: t("REGISTER.JOB_SECTORS.INFORMATION_TECHNOLOGY"),
		insurance: t("REGISTER.JOB_SECTORS.INSURANCE"),
		law_legislation: t("REGISTER.JOB_SECTORS.LAW_LEGISLATION"),
		leasing: t("REGISTER.JOB_SECTORS.LEASING"),
		management: t("REGISTER.JOB_SECTORS.MANAGEMENT"),
		manufacturing: t("REGISTER.JOB_SECTORS.MANUFACTURING"),
		marketing_advertising_pr: t("REGISTER.JOB_SECTORS.MARKETING_ADVERTISING_PR"),
		mechanical_engineering: t("REGISTER.JOB_SECTORS.MECHANICAL_ENGINEERING"),
		mining_metallurgy: t("REGISTER.JOB_SECTORS.MINING_METALLURGY"),
		pharmaceutical_industry: t("REGISTER.JOB_SECTORS.PHARMACEUTICAL_INDUSTRY"),
		public_administration: t("REGISTER.JOB_SECTORS.PUBLIC_ADMINISTRATION"),
		quality_management: t("REGISTER.JOB_SECTORS.QUALITY_MANAGEMENT"),
		security_and_protection: t("REGISTER.JOB_SECTORS.SECURITY_AND_PROTECTION"),
		senior_management: t("REGISTER.JOB_SECTORS.SENIOR_MANAGEMENT"),
		services: t("REGISTER.JOB_SECTORS.SERVICES"),
		telecommunications: t("REGISTER.JOB_SECTORS.TELECOMMUNICATIONS"),
		textile_leather_fashion_industry: t("REGISTER.JOB_SECTORS.TEXTILE_LEATHER_FASHION_INDUSTRY"),
		tourism_hospitality_gastronomy: t("REGISTER.JOB_SECTORS.TOURISM_HOSPITALITY_GASTRONOMY"),
		trade: t("REGISTER.JOB_SECTORS.TRADE"),
		translation_interpreting: t("REGISTER.JOB_SECTORS.TRANSLATION_INTERPRETING"),
		transportation_shipping_logistics: t("REGISTER.JOB_SECTORS.TRANSPORTATION_SHIPPING_LOGISTICS"),
		water_management_forestry_environment: t("REGISTER.JOB_SECTORS.WATER_MANAGEMENT_FORESTRY_ENVIRONMENT"),
		woodworking_industry: t("REGISTER.JOB_SECTORS.WOODWORKING_INDUSTRY"),
	};

	const genders = {
		male: t("REGISTER.GENDERS.MALE"),
		female: t("REGISTER.GENDERS.FEMALE"),
		other: t("REGISTER.GENDERS.OTHER"),
		prefer_not_to_say: t("REGISTER.GENDERS.PREFER_NOT_TO_SAY"),
	};

	const residence = {
		citizen: t("REGISTER.RESIDENCE.CITIZEN"),
		immigrant: t("REGISTER.RESIDENCE.IMMIGRANT"),
	};

	const education = {
		primary: t("REGISTER.EDUCATION.PRIMARY"),
		secondary_certificate: t("REGISTER.EDUCATION.SECONDARY_CERTIFICATE"),
		secondary_diploma: t("REGISTER.EDUCATION.SECONDARY_DIPLOMA"),
		post_secondary: t("REGISTER.EDUCATION.POST_SECONDARY"),
		tertiary: t("REGISTER.EDUCATION.TERTIARY"),
	};

	return { europeanCountryCodes, jobSectors, genders, residence, education };
};
