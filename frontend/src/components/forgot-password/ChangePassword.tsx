import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import { useSnackbar } from "contexts/SnackbarProvider";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setToken } from "redux/authSlice";
import axiosRequest from "utils/axios";
import { confirmNewPasswordSchema, passwordSchema } from "utils/validationSchemas";
import * as yup from "yup";
import Eye from "images/eye.svg?react";
import EyeSlash from "images/eye-slash.svg?react";

type ResetPasswordForm = {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
	apiError?: any;
};

type TokenResponse = {
	token: string;
};

const ChangePasswordForm = () => {
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const [showPassword, setShowPassword] = useState(false);

	const formSchema = yup.object().shape({
		oldPassword: passwordSchema,
		newPassword: passwordSchema,
		confirmPassword: confirmNewPasswordSchema,
	});

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<ResetPasswordForm>({
		resolver: yupResolver(formSchema) as Resolver<ResetPasswordForm>,
	});

	const handlePasswordChange = async (passwordForm: ResetPasswordForm) => {
		const response = await axiosRequest<TokenResponse>("PUT", "/api/user/password/change", passwordForm);
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			return;
		}
		const rememberMe = localStorage.getItem("authToken");
		dispatch(setToken({ token: response.data.token, rememberMe: !!rememberMe }));
		openSuccessSnackbar(t("SNACKBAR.PASSWORD_CHANGED"));
		setValue("oldPassword", "");
		setValue("newPassword", "");
		setValue("confirmPassword", "");
	};

	return (
		<form className="change-password password-wrapper" onSubmit={handleSubmit(handlePasswordChange)}>
			<div className="field-wrapper">
				<div className="left">
					<header>{t("SETTINGS.CHANGE_PASSWORD")}</header>
					<input placeholder={t("SETTINGS.OLD_PASSWORD")} type={showPassword ? "text" : "password"} {...register("oldPassword")} className={`${errors.oldPassword ? "border-red-600" : ""}`} />
					<p className={`${errors.oldPassword ? "visible" : "invisible"} text-sm ml-2 text-red-600 font-bold`}>{errors.oldPassword?.message && t(errors.oldPassword.message)}!</p>
					<input placeholder={t("SETTINGS.NEW_PASSWORD")} type={showPassword ? "text" : "password"} {...register("newPassword")} className={`${errors.newPassword ? "border-red-600" : ""}`} />
					<p className={`${errors.newPassword ? "visible" : "invisible"} text-sm ml-2 text-red-600 font-bold`}>{errors.newPassword?.message && t(errors.newPassword.message)}!</p>
				</div>
				<div className="right">
					<div className="password-wrapper">
						<input placeholder={t("SETTINGS.NEW_PASSWORD_AGAIN")} type={showPassword ? "text" : "password"} {...register("confirmPassword")} className={`${errors.confirmPassword ? "border-red-600" : ""}`} />
						{showPassword ? <EyeSlash className="eye" onClick={() => setShowPassword(false)} /> : <Eye className="eye" onClick={() => setShowPassword(true)} />}
					</div>
					<p className={`${errors.confirmPassword ? "visible" : "invisible"} text-sm ml-2 text-red-600 font-bold`}>{errors.confirmPassword?.message && t(errors.confirmPassword.message)}!</p>
				</div>
			</div>
			<Button type="submit">{t("SETTINGS.CONFIRM_CHANGE_PASSWORD")}</Button>
		</form>
	);
};

export default ChangePasswordForm;
