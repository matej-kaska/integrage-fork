import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import ForgotPasswordModal from "components/forgot-password/ForgotPasswordModal";
import ResetPasswordModal from "components/forgot-password/ResetPasswordModal";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import Arrow from "images/arrow.svg?react";
import { useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { setToken, setUser } from "redux/authSlice";
import axiosRequest from "utils/axios";
import { emailSchema, passwordSchema, rememberMeSchema } from "utils/validationSchemas";
import * as yup from "yup";
import Eye from "images/eye.svg?react";
import EyeSlash from "images/eye-slash.svg?react";
import { Helmet } from "react-helmet-async";
import { websiteUrl } from "consts/SEOConsts";

type LoginForm = {
	email: string;
	password: string;
	rememberme: boolean;
	apiError?: string;
};

type LoginResponse = {
	message: { en: string; cz: string };
};

type TokenResponse = {
	token: string;
};

type UserResponse = {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	role: "user" | "analytic" | "admin";
	is_staff: boolean;
};

const LoginPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [searchParams, _] = useSearchParams();
	const dispatch = useDispatch();
	const { openSuccessSnackbar, openInfoSnackbar, openErrorSnackbar } = useSnackbar();
	const { showModal } = useModal();
	const [loaded, setLoaded] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		setLoaded(true);
		if (!loaded) return;
		const registerToken = searchParams.get("registration-token");
		const resetToken = searchParams.get("reset-token");
		if (registerToken) {
			handleRegisterValidate(registerToken);
		}
		if (resetToken) {
			showModal(<ResetPasswordModal token={resetToken} />);
		}
	}, [searchParams, loaded]);

	const handleLogin = async (data: LoginForm) => {
		const response = await axiosRequest<TokenResponse>("POST", "/api/user/token", data);
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			setError("apiError", { message: message });
			openErrorSnackbar(message);
			return;
		}
		dispatch(setToken({ token: response.data.token, rememberMe: data.rememberme }));

		const responseUser = await axiosRequest<UserResponse>("GET", "/api/user/me");
		if (!responseUser.success) {
			const message = t(`BACKEND-RESPONSES.${responseUser.message.en}`);
			setError("apiError", { message: message });
			openErrorSnackbar(message);
			return;
		}
		const user = {
			userInfo: responseUser.data,
			rememberMe: data.rememberme,
		};
		dispatch(setUser(user));
		openInfoSnackbar(t("SNACKBAR.LOGIN"));
		navigate("/");
	};
	
	const handleRegisterValidate = async (token: string) => {
		const response = await axiosRequest<LoginResponse>("POST", "/api/user/register/validate", { token: token });
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			setError("apiError", { message: message });
			return;
		}
		openSuccessSnackbar(t("SNACKBAR.ACTIVATION_SUCCESS"));
	};

	const formSchema = yup.object().shape({
		email: emailSchema,
		password: passwordSchema,
		rememberme: rememberMeSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		resolver: yupResolver(formSchema) as Resolver<LoginForm>,
	});

	return (
		<div className="login-page-wrapper">
			<Helmet>
				<title>Login - IntegrAGE - Self-Assessment Tool</title>
				<meta name="description" content="Log in to your IntegrAGE account to access the self-assessment tool designed for workers aged 55+. Evaluate your skills and enhance your career development today." />
				<link rel="canonical" href={`${websiteUrl}/login`} />
			</Helmet>
			<div className="filler" />
			<main className="login-page">
				<div className="left-side">
					<button type="button" className="back-button" onClick={() => navigate("/")}>
						<Arrow />
					</button>
				</div>
				<div className="middle">
					<h1>{t("LOGIN.TITLE")}</h1>
					<div className="register-wrapper">
						<span className="no-account">
							{t("LOGIN.NO_ACCOUNT")} <Link to={"/register"} title="Register">{t("LOGIN.REGISTER")}</Link>
						</span>
					</div>
					<form className="login-form" onSubmit={handleSubmit(handleLogin)}>
						<input type="email" placeholder={t("LOGIN.EMAIL")} className={`${errors.email ? "border-red-600" : ""}`} {...register("email")} />
						<p className={`${errors.email ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.email?.message && t(errors.email.message)}!</p>
						<div className="password-wrapper">
							<input type={showPassword ? "text" : "password"} placeholder={t("LOGIN.PASSWORD")} className={`${errors.password ? "border-red-600" : ""}`} {...register("password")} />
							{showPassword ? <EyeSlash className="eye" onClick={() => setShowPassword(false)} /> : <Eye className="eye" onClick={() => setShowPassword(true)} />}
						</div>
						<p className={`${errors.password ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.password?.message && t(errors.password.message)}!</p>
						<div className="form-footer">
							<div className="remember-me-wrapper">
								<input type="checkbox" id="remember-me" {...register("rememberme")} />
								<label htmlFor="remember-me">{t("LOGIN.REMEMBER_ME")}</label>
							</div>
							<span className="forgot-password" onClick={() => showModal(<ForgotPasswordModal />)}>
								{t("LOGIN.FORGOT_PASSWORD")}
							</span>
						</div>
						<p className={`${errors.apiError ? "visible" : "invisible"} text-sm text-red-600 font-bold`}>{errors.apiError?.message && t(errors.apiError.message)}!</p>
						<Button type="submit">{t("LOGIN.LOGIN")}</Button>
					</form>
				</div>
				<div className="right-side" />
			</main>
		</div>
	);
};

export default LoginPage;
