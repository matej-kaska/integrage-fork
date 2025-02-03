import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import Footer from "components/footer/Footer";
import Navbar from "components/navbar/Navbar";
import RegisterDropdowns from "components/register-dropdowns/RegisterDropdowns";
import useTransRegister from "consts/useTransRegister";
import { useSnackbar } from "contexts/SnackbarProvider";
import countries from "i18n-iso-countries";
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { type RootState, store } from "redux/store";
import type { TUserInfo, UserData } from "types/userInfo";
import axiosRequest, { clearAxiosAuthorization } from "utils/axios";
import { ageSchema, firstNameSchema, lastNameSchema, locationSchema } from "utils/validationSchemas";
import * as yup from "yup";
import ChangePasswordForm from "components/forgot-password/ChangePassword";
import GeneralModal from "components/general-modal/GeneralModal";
import { useModal } from "contexts/ModalProvider";
import bgLocale from "i18n-iso-countries/langs/bg.json";
import csLocale from "i18n-iso-countries/langs/cs.json";
import deLocale from "i18n-iso-countries/langs/de.json";
import enLocale from "i18n-iso-countries/langs/en.json";
import hrLocale from "i18n-iso-countries/langs/hr.json";
import huLocale from "i18n-iso-countries/langs/hu.json";
import skLocale from "i18n-iso-countries/langs/sk.json";
import slLocale from "i18n-iso-countries/langs/sl.json";
import bsLocale from "i18n-iso-countries/langs/bs.json";
import srLocale from "i18n-iso-countries/langs/sr.json";
import { removeUser, setUser } from "redux/authSlice";
import Loading from "components/loading/Loading";
import { Helmet } from "react-helmet-async";
import { websiteUrl } from "consts/SEOConsts";

const CountryDropdown = lazy(() => import('components/country-dropdown/CountryDropdown'));

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

type EditForm = {
	firstName: string;
	lastName: string;
	location: string;
	residence: string;
	education: string;
	gender: string;
	age: number;
	employment: boolean;
	unemployedMonths?: number;
	jobField?: string[];
	locale?: string;
	apiError?: string;
};

const ProfilePage = () => {
	const { t, i18n } = useTranslation();
	const { openErrorSnackbar, openSuccessSnackbar } = useSnackbar();
	const { showModal, closeModal } = useModal();
	const userInfo = useSelector((state: RootState) => state.auth.userInfo);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [userData, setUserData] = useState<UserData | null>(null);
	const editRef = useRef<HTMLButtonElement>(null);
	const [loading, setLoading]	= useState<boolean>(true);

	const [editing, setEditing] = useState<boolean>(false);
	const { jobSectors, genders, residence, education } = useTransRegister();
	const residenceSchema = yup.string().required("VALIDATION.REQUIRED").oneOf(Object.keys(residence));
	const educationSchema = yup.string().required("VALIDATION.REQUIRED").oneOf(Object.keys(education));
	const genderSchema = yup.string().required("VALIDATION.REQUIRED").oneOf(Object.keys(genders));
	const [validated, setValidated] = useState<boolean>(false);
	const [location, setLocation] = useState<string>("");
	const [country, setCountry] = useState<string>("");
	const [employed, setEmployed] = useState<boolean | undefined>(undefined);
	const [jobs, setJobs] = useState<string[]>([]);

	useLayoutEffect(() => {
		if (!userInfo.id) {
			navigate("/login");
		}
		getUserData();
	}, []);

	useEffect(() => {
		if (!userData?.country) return;
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
		const lang = i18n.language as keyof Locales;
		const locale = locales[lang] || locales.en;
		countries.registerLocale(locale);
		setCountry(countries.getName(userData?.country, i18n.language) || "");
		setLocation(userData?.country);
	}, [userData?.country]);

	const getUserData = async () => {
		const response = await axiosRequest<UserData>("GET", "/api/user/me/full");
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			return;
		}
		setUserData(response.data);
		setLoading(false);
	};

	const formSchema = yup.object().shape({
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		location: locationSchema,
		residence: residenceSchema,
		education: educationSchema,
		gender: genderSchema,
		age: ageSchema,
		employment: yup.boolean().required("VALIDATION.REQUIRED"),
		unemployedMonths: yup
			.number()
			.typeError("VALIDATION.REQUIRED")
			.required("VALIDATION.REQUIRED")
			.min(0, "VALIDATION.UNEMPLOYED_MIN")
			.max(1000, "VALIDATION.UNEMPLOYED_MAX")
			.when("employment", { is: (employment: boolean) => employment === true, then: (schema) => schema.notRequired() }),
		jobField: yup
			.array()
			.of(yup.string().oneOf(Object.keys(jobSectors)))
			.when("employment", { is: (employment: boolean) => employment === true, then: (schema) => schema.required("VALIDATION.REQUIRED").min(1, "VALIDATION.REQUIRED"), otherwise: (schema) => schema.notRequired() }),
	});

	const {
		setError,
		register,
		handleSubmit,
		setValue,
		getValues,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<EditForm>({
		resolver: yupResolver(formSchema) as Resolver<EditForm>,
	});

	useLayoutEffect(() => {
		if (!userData) return;
		setValue("firstName", userData.first_name);
		setValue("lastName", userData.last_name);
		setValue("location", userData.country);
		setValue("residence", userData.residence);
		setValue("education", userData.education);
		setValue("gender", userData.gender);
		setValue("age", userData.age);
		setValue("employment", userData.employment);
		setValue("unemployedMonths", userData.unemployed_months || undefined);
		setValue("jobField", userData.job_fields || []);
		userData.job_fields && setJobs(userData.job_fields);
	}, [userData, editing]);

	useEffect(() => {
		if (isSubmitting) {
			setValidated(true);
		}
	}, [isSubmitting]);

	useEffect(() => {
		setValue("location", location);
		if (location) {
			clearErrors("location");
		}
	}, [location]);

	useEffect(() => {
		if (typeof employed === "boolean") {
			clearErrors("employment");
			setValue("employment", employed);
			if (employed) {
				setJobs([]);
			} else {
				setValue("unemployedMonths", undefined);
			}
			if (!employed && validated && !getValues("unemployedMonths")) {
				setError("unemployedMonths", { message: "VALIDATION.REQUIRED" });
			}
			if (employed && validated && jobs.length === 0) {
				setError("jobField", { message: "VALIDATION.REQUIRED" });
			}
		}
	}, [employed]);

	useEffect(() => {
		setEmployed(getValues("employment"));
	}, [getValues("employment")]);

	useEffect(() => {
		setValue("jobField", jobs);
		if (jobs.length > 0) {
			clearErrors("jobField");
		} else if (validated) {
			setError("jobField", { message: "VALIDATION.REQUIRED" });
		}
	}, [jobs]);

	const handleEdit = async (editForm: EditForm) => {
		const response = await axiosRequest<UserData>("PUT", "/api/user/update", editForm);
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			return;
		}
		setUserData(response.data);
		setEditing(false);
		setValidated(false);
		const userInfoResponse = await axiosRequest<TUserInfo>("GET", "/api/user/me");
		if (!userInfoResponse.success) {
			const message = t(`BACKEND-RESPONSES.${userInfoResponse.message.en}`);
			openErrorSnackbar(message);
			return;
		}
		const rememberMe = localStorage.getItem("authToken");
		dispatch(setUser({ rememberMe: !!rememberMe, userInfo: userInfoResponse.data }));
		openSuccessSnackbar(t("SETTINGS.PROFILE_UPDATED"));
	};

	const deleteAccount = async (password: string) => {
		const response = await axiosRequest("DELETE", "/api/user/delete", { password: password });
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			return;
		}
		closeModal();
		navigate("/");
		openSuccessSnackbar(t("SETTINGS.DELETED"));
		store.dispatch(removeUser());
		clearAxiosAuthorization();
	};

	if (loading) {
		return (
			<>
				<Helmet>
					<title>IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
					<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
					<link rel="canonical" href={`${websiteUrl}/profile`} />
				</Helmet>
				<Navbar />
				<main className="profile-page">
					<Loading />
				</main>
				<Footer />
			</>
		)
	};

	return (
		<>
			<Helmet>
				<title>IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
				<meta name="description" content="IntegrAGE - Discover your strengths with self-assessment tool for workers aged 55+. Evaluate your skills in technology, workplace integration and well-being." />
				<link rel="canonical" href={`${websiteUrl}/profile`} />
			</Helmet>
			<Navbar />
			<main className="profile-page">
				<div className="container">
					<h3 className="header">{t("NAVBAR.DETAILS")}</h3>
					<form className={`full-info-wrapper ${editing ? "editing" : ""}`} onSubmit={handleSubmit(handleEdit)}>
						<div className="info-wrapper">
							<div className="left first">
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.FIRST_NAME")}:</span>
											<span className="field-value">{userData?.first_name}</span>
										</>
									) : (
										<>
											<input className={`edit-input ${errors.firstName ? "border-red-600" : ""}`} placeholder={t("REGISTER.FIRST_NAME")} type="text" {...register("firstName")} />
											<p className={`${errors.firstName ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.firstName?.message && t(errors.firstName.message)}!</p>
										</>
									)}
								</div>
							</div>
							<div className="right first">
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.LAST_NAME")}:</span>
											<span className="field-value">{userData?.last_name}</span>
										</>
									) : (
										<>
											<input className={`edit-input ${errors.lastName ? "border-red-600" : ""}`} placeholder={t("REGISTER.FIRST_NAME")} type="text" {...register("lastName")} />
											<p className={`${errors.lastName ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.lastName?.message && t(errors.lastName.message)}!</p>
										</>
									)}
								</div>
							</div>
						</div>
						<div className="info-wrapper">
							<div className="full">
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.EMAIL")}:</span>
											<span className="field-value">{userData?.email}</span>
										</>
									) : (
										<>
											<span className="field-value ml-3">
												<span className="font-normal">{t("REGISTER.EMAIL")}: </span>
												{userData?.email}
											</span>
											<p className="invisible text-sm">!</p>
										</>
									)}
								</div>
							</div>
						</div>
						<div className="info-wrapper">
							<div className="left">
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.COUNTRY")}:</span>
											<span className="field-value">{country}</span>
										</>
									) : (
										<>
											<Suspense fallback={<Loading />}>
												<CountryDropdown location={location} setLocation={setLocation} error={Boolean(errors.location)} />
											</Suspense>
											<p className={`${errors.location ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.location?.message && t(errors.location.message)}!</p>
										</>
									)}
								</div>
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.AGE")}:</span>
											<span className="field-value">{userData?.age}</span>
										</>
									) : (
										<>
											<input type="number" placeholder={t("REGISTER.AGE")} min={0} className={`edit-input ${errors.age ? "border-red-600" : ""}`} {...register("age")} />
											<p className={`${errors.age ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.age?.message && t(errors.age.message)}!</p>
										</>
									)}
								</div>
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.EDUCATION_LEVEL")}:</span>
											<span className="field-value">{t(`REGISTER.EDUCATION.${userData?.education.toUpperCase()}`)}</span>
										</>
									) : (
										<>
											<RegisterDropdowns options={education} setValue={setValue} getValues={getValues} type={"education"} multiple={false} error={Boolean(errors.education?.message)} defaultText={t("REGISTER.EDUCATION_LEVEL")} clearErrors={clearErrors} />
											<p className={`${errors.education ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.education?.message && t(errors.education.message)}!</p>
										</>
									)}
								</div>
							</div>
							<div className="right">
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.TYPE_RESIDENCE")}:</span>
											<span className="field-value">{t(`REGISTER.RESIDENCE.${userData?.residence.toUpperCase()}`)}</span>
										</>
									) : (
										<>
											<RegisterDropdowns options={residence} setValue={setValue} getValues={getValues} type={"residence"} multiple={false} error={Boolean(errors.residence)} defaultText={t("REGISTER.TYPE_RESIDENCE")} clearErrors={clearErrors} />
											<p className={`${errors.residence ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.residence?.message && t(errors.residence.message)}!</p>
										</>
									)}
								</div>
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.GENDER")}:</span>
											<span className="field-value">{t(`REGISTER.GENDERS.${userData?.gender.toUpperCase()}`)}</span>
										</>
									) : (
										<>
											<RegisterDropdowns options={genders} setValue={setValue} getValues={getValues} type={"gender"} multiple={false} error={Boolean(errors.gender)} defaultText={t("REGISTER.GENDER")} clearErrors={clearErrors} />
											<p className={`${errors.gender ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.gender?.message && t(errors.gender.message)}!</p>
										</>
									)}
								</div>
								<div className="field-wrapper">
									{!editing ? (
										<>
											<span className="field-name">{t("REGISTER.EMPLOYED")}:</span>
											<span className="field-value">{userData?.employment ? t("REGISTER.YES") : t("REGISTER.NO")}</span>
										</>
									) : (
										<>
											<RegisterDropdowns options={{ yes: t("REGISTER.YES"), no: t("REGISTER.NO") }} setValue={setValue} getValues={getValues} type={"employment"} multiple={false} error={Boolean(errors.employment)} defaultText={t("REGISTER.EMPLOYED")} clearErrors={clearErrors} />
											<p className={`${errors.employment ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.employment?.message && t(errors.employment.message)}!</p>
										</>
									)}
								</div>
							</div>
						</div>
						<div className="info-wrapper">
							<div className="full">
								{!editing && (
									<>
										{" "}
										{userData?.employment ? (
											<div className="field-wrapper">
												<span className="field-name">{t("REGISTER.JOB_SECTOR")}:</span>
												<span className="field-value">{userData?.job_fields.map((field) => t(`REGISTER.JOB_SECTORS.${field.toUpperCase()}`)).join(", ")}</span>
											</div>
										) : (
											<div className="field-wrapper">
												<span className="field-name">{t("REGISTER.UNEMPLOYED")}:</span>
												<span className="field-value">{userData?.unemployed_months}</span>
											</div>
										)}
									</>
								)}
								{editing && (
									!employed ? (
											<>
												<input type="number" placeholder={t("REGISTER.UNEMPLOYED")} min={0} className={`edit-input ${errors.unemployedMonths ? "border-red-600" : ""}`} {...register("unemployedMonths")} />
												<p className={`${errors.unemployedMonths ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.unemployedMonths?.message && t(errors.unemployedMonths.message)}!</p>
											</>
										) : (
											<>
												<RegisterDropdowns options={jobSectors} setValue={setValue} getValues={getValues} type={"jobField"} multiple={true} error={Boolean(errors.jobField)} defaultText={t("REGISTER.JOB_SECTOR")} multipleSelected={jobs} setMultipleSelected={setJobs} clearErrors={clearErrors} />
												<p className={`${errors.jobField ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.jobField?.message && t(errors.jobField.message)}!</p>
											</>
										)
								)}
							</div>
						</div>
						<button type="submit" className="hidden" ref={editRef} />
					</form>
					<div className="separator" />
					<ChangePasswordForm />
					<div className="separator" />
					<div className="footer-wrapper">
						<Button size="large" className={`${!editing ? "block" : "hidden"}`} onClick={() => setEditing(true)}>
							{t("SETTINGS.EDIT_DETAILS")}
						</Button>
						<Button size="large" className={`${!editing ? "block" : "hidden"}`} color="reverse-accent" onClick={() => showModal(<GeneralModal text={t("SETTINGS.DELETE_ACCOUNT_CONFIRM")} actionOnClickWparam={deleteAccount} input={t("SETTINGS.CONFIRM_PASSWORD")} eye/>)}>
							{t("SETTINGS.DELETE_ACCOUNT")}
						</Button>
						<Button size="large" className={`${editing ? "block" : "hidden"}`} onClick={() => editRef.current?.click()}>
							{t("SETTINGS.SAVE_DETAILS")}
						</Button>
						<Button size="large" className={`${editing ? "block" : "hidden"}`} color="reverse-accent" onClick={() => setEditing(false)}>
							{t("SETTINGS.CANCEL_EDIT")}
						</Button>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
};

export default ProfilePage;
