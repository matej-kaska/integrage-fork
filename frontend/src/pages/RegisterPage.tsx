import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import RegisterDropdowns from "components/register-dropdowns/RegisterDropdowns";
import useTransRegister from "consts/useTransRegister";
import { useSnackbar } from "contexts/SnackbarProvider";
import Arrow from "images/arrow.svg?react";
import { lazy, Suspense, useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axiosRequest from "utils/axios";
import { ageSchema, confirmPasswordSchema, emailSchema, firstNameSchema, gdprSchema, lastNameSchema, locationSchema, passwordSchema } from "utils/validationSchemas";
import * as yup from "yup";
import Eye from "images/eye.svg?react";
import EyeSlash from "images/eye-slash.svg?react";
import { Helmet } from "react-helmet-async";
import { websiteUrl } from "consts/SEOConsts";
import Loading from "components/loading/Loading";

const CountryDropdown = lazy(() => import('components/country-dropdown/CountryDropdown'));

export type RegisterForm = {
	firstName: string;
	lastName: string;
	email: string;
	location: string;
	password: string;
	confirmPwd: string;
	gdpr: boolean;
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

type RegisterResponse = {
	message: { en: string; cz: string };
};

const RegisterPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [location, setLocation] = useState<string>("");
	const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
	const { jobSectors, genders, residence, education } = useTransRegister();
	const residenceSchema = yup.string().required("VALIDATION.REQUIRED").oneOf(Object.keys(residence));
	const educationSchema = yup.string().required("VALIDATION.REQUIRED").oneOf(Object.keys(education));
	const genderSchema = yup.string().required("VALIDATION.REQUIRED").oneOf(Object.keys(genders));
	const [employed, setEmployed] = useState<boolean | undefined>(undefined);
	const [jobs, setJobs] = useState<string[]>([]);
	const [validated, setValidated] = useState<boolean>(false);
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const [showPassword, setShowPassword] = useState(false);

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
		setValue("jobField", jobs);
		if (jobs.length > 0) {
			clearErrors("jobField");
		} else if (validated) {
			setError("jobField", { message: "VALIDATION.REQUIRED" });
		}
	}, [jobs]);

	const handleRegister = async (data: RegisterForm) => {
		setRegisterSuccess(false);
		const response = await axiosRequest<RegisterResponse>("POST", "/api/user/register", data);
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			setError("apiError", { message: message });
			return;
		}
		setRegisterSuccess(true);
		openSuccessSnackbar(t("SNACKBAR.ACTIVATION_SENT"));
	};

	const goBackOrHome = () => {
		if (document.referrer) {
			window.history.back();
		} else {
			navigate("/");
		}
	};

	const formSchema = yup.object().shape({
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		email: emailSchema,
		location: locationSchema,
		password: passwordSchema,
		confirmPwd: confirmPasswordSchema,
		gdpr: gdprSchema,
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
	} = useForm<RegisterForm>({
		resolver: yupResolver(formSchema) as Resolver<RegisterForm>,
	});

	useEffect(() => {
		if (isSubmitting) {
			setValidated(true);
		}
	}, [isSubmitting]);

	return (
		<main className="register-page">
			<Helmet>
				<title>Register - IntegrAGE - Self-Assessment Tool for Workers aged 55+</title>
				<meta name="description" content="Register for IntegrAGE to start using our self-assessment tool for workers aged 55+. Discover your strengths and improve your skills in technology, integration, and well-being." />
				<link rel="canonical" href={`${websiteUrl}/register`} />
			</Helmet>
			<div className="left-side">
				<button type="button" className="back-button" onClick={() => goBackOrHome()}>
					<Arrow />
				</button>
			</div>
			<div className="middle">
				<h1>{t("REGISTER.TITLE")}</h1>
				<div className="login-wrapper">
					<span className="account">
						{t("REGISTER.HAVE_ACCOUNT")} <Link to={"/login"} title="Login">{t("REGISTER.LOGIN")}</Link>
					</span>
				</div>
				<form className="register-form" onSubmit={handleSubmit(handleRegister)}>
					<div className="names-wrapper">
						<div className="name-wrapper">
							<input type="text" placeholder={t("REGISTER.FIRST_NAME")} className={`${errors.firstName ? "border-red-600" : ""}`} {...register("firstName")} />
							<p className={`${errors.firstName ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.firstName?.message && t(errors.firstName.message)}!</p>
						</div>
						<div className="name-wrapper">
							<input type="text" placeholder={t("REGISTER.LAST_NAME")} className={`${errors.lastName ? "border-red-600" : ""}`} {...register("lastName")} />
							<p className={`${errors.lastName ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.lastName?.message && t(errors.lastName.message)}!</p>
						</div>
					</div>
					<input type="email" placeholder={t("REGISTER.EMAIL")} className={`${errors.email ? "border-red-600" : ""}`} {...register("email")} />
					<p className={`${errors.email ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.email?.message && t(errors.email.message)}!</p>
					<div className="separator" />
					<Suspense fallback={<Loading />}>
						<CountryDropdown location={location} setLocation={setLocation} error={Boolean(errors.location)} />
					</Suspense>
					<p className={`${errors.location ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.location?.message && t(errors.location.message)}!</p>
					<RegisterDropdowns options={residence} setValue={setValue} getValues={getValues} type={"residence"} multiple={false} error={Boolean(errors.residence)} defaultText={t("REGISTER.TYPE_RESIDENCE")} clearErrors={clearErrors} />
					<p className={`${errors.residence ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.residence?.message && t(errors.residence.message)}!</p>
					<div className="two-inline-wrapper">
						<div className="one-item-wrapper">
							<input type="number" placeholder={t("REGISTER.AGE")} min={0} className={`${errors.age ? "border-red-600" : ""}`} {...register("age")} />
							<p className={`${errors.age ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.age?.message && t(errors.age.message)}!</p>
						</div>
						<div className="one-item-wrapper">
							<RegisterDropdowns options={genders} setValue={setValue} getValues={getValues} type={"gender"} multiple={false} error={Boolean(errors.gender)} defaultText={t("REGISTER.GENDER")} clearErrors={clearErrors} />
							<p className={`${errors.gender ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.gender?.message && t(errors.gender.message)}!</p>
						</div>
					</div>
					<div className="separator" />
					<RegisterDropdowns options={education} setValue={setValue} getValues={getValues} type={"education"} multiple={false} error={Boolean(errors.education?.message)} defaultText={t("REGISTER.EDUCATION_LEVEL")} clearErrors={clearErrors} />
					<p className={`${errors.education ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.education?.message && t(errors.education.message)}!</p>
					<div className={`radio-field ${errors.employment ? "border-red-600" : ""}`}>
						<span className={`text ${typeof employed === "boolean" ? "answered" : ""} ${errors.employment ? "border-red-600" : ""}`}>{t("REGISTER.EMPLOYED")}</span>
						<div className="radios-wrapper">
							<div className="radio-wrapper">
								<input
									type="radio"
									name="employed"
									id="employed"
									checked={employed || false}
									onChange={() => setEmployed(true)}
									readOnly
									tabIndex={0}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											setEmployed(true);
											event.preventDefault();
										}
									}}
								/>
								<label htmlFor="employed">{t("REGISTER.YES")}</label>
							</div>
							<div className="radio-wrapper">
								<input
									type="radio"
									name="unemployed"
									id="unemployed"
									checked={(!employed && typeof employed === "boolean") || false}
									onChange={() => setEmployed(false)}
									readOnly
									tabIndex={0}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											setEmployed(false);
											event.preventDefault();
										}
									}}
								/>
								<label htmlFor="unemployed">{t("REGISTER.NO")}</label>
							</div>
						</div>
					</div>
					<p className={`${errors.employment ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.employment?.message && t(errors.employment.message)}!</p>
					{typeof employed === "boolean" &&
						(employed ? (
							<>
								<RegisterDropdowns options={jobSectors} setValue={setValue} getValues={getValues} type={"jobField"} multiple={true} error={Boolean(errors.jobField)} defaultText={t("REGISTER.JOB_SECTOR")} multipleSelected={jobs} setMultipleSelected={setJobs} clearErrors={clearErrors} />
								<p className={`${errors.jobField ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.jobField?.message && t(errors.jobField.message)}!</p>
							</>
						) : (
							<>
								<input type="number" placeholder={t("REGISTER.UNEMPLOYED")} min={0} className={`${errors.unemployedMonths ? "border-red-600" : ""}`} {...register("unemployedMonths")} />
								<p className={`${errors.unemployedMonths ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.unemployedMonths?.message && t(errors.unemployedMonths.message)}!</p>
							</>
						))}
					<div className="separator" />
					<div className="password-wrapper">
						<input type={showPassword ? "text" : "password"} placeholder={t("REGISTER.PASSWORD")} className={`${errors.password ? "border-red-600" : ""}`} {...register("password")} />
						{showPassword ? <EyeSlash className="eye" onClick={() => setShowPassword(false)} /> : <Eye className="eye" onClick={() => setShowPassword(true)} />}
					</div>
					<p className={`${errors.password ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.password?.message && t(errors.password.message)}!</p>
					<input type={showPassword ? "text" : "password"} placeholder={t("REGISTER.CONFIRM_PASSWORD")} className={`${errors.confirmPwd ? "border-red-600" : ""}`} {...register("confirmPwd")} />
					<p className={`${errors.confirmPwd ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.confirmPwd?.message && t(errors.confirmPwd.message)}!</p>
					<div className="form-footer">
						<div className="checkbox-wrapper">
							<input
								type="checkbox"
								id="gdpr-check"
								{...register("gdpr")}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										setValue("gdpr", !getValues("gdpr"));
										event.preventDefault();
									}
								}}
							/>
							<label htmlFor="gdpr-check">{t("REGISTER.GDPR_1")}</label>
							<Link to={"/gdpr"} title="gdpr">{t("REGISTER.GDPR_2")}</Link>
						</div>
						<p className={`${errors.gdpr ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.gdpr?.message && t(errors.gdpr.message)}!</p>
					</div>
					<p className={`${errors.apiError || registerSuccess ? "visible" : "invisible"} text-base ${registerSuccess ? "text-green-600" : "text-red-600"} font-bold`}>{registerSuccess ? t("REGISTER.ACTIVATION_SENT") : errors.apiError?.message && t(errors.apiError.message)}!</p>
					<Button
						type="submit"
						className="register-button"
						onKeyDown={(event) => {
							if (event.key === "Enter") handleSubmit(handleRegister);
						}}
					>
						{t("REGISTER.REGISTER")}
					</Button>
				</form>
			</div>
			<div className="right-side" />
		</main>
	);
};

export default RegisterPage;
