import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import CloseIcon from "images/close.svg?react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import axiosRequest from "utils/axios";
import { confirmPasswordSchema, passwordSchema } from "utils/validationSchemas";
import * as yup from "yup";
import Eye from "images/eye.svg?react";
import EyeSlash from "images/eye-slash.svg?react";

type ResetPasswordForm = {
	password: string;
	confirmPwd: string;
	apiError?: any;
};

type APIResponse = {
	message: { en: string; cz: string };
};

type ResetPasswordModalProps = {
	token: string;
};

const ResetPasswordModal = ({ token }: ResetPasswordModalProps) => {
	const { closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);

	const handleReset = async (data: ResetPasswordForm) => {
		const newData = { ...data, token: token };
		const response = await axiosRequest<APIResponse>("POST", "/api/user/password/reset", newData);
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			setError("apiError", { message: message });
			return;
		}
		openSuccessSnackbar(t("SNACKBAR.PASSWORD_CHANGED"));
		closeModal();
	};

	const formSchema = yup.object().shape({
		password: passwordSchema,
		confirmPwd: confirmPasswordSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordForm>({
		resolver: yupResolver(formSchema),
	});

	return (
		<section className="reset-password-modal">
			<div className="top-wrapper">
				<CloseIcon onClick={closeModal} />
			</div>
			<div className="wrapper">
				<h3>{t("RESET_PASSWORD.TITLE")}</h3>
				<form onSubmit={handleSubmit(handleReset)}>
					<div className="password-wrapper">
						<input type={showPassword ? "text" : "password"} placeholder={t("RESET_PASSWORD.PASSWORD")} className={`${errors.password ? "border-red-600" : ""}`} {...register("password")} />
						{showPassword ? <EyeSlash className="eye" onClick={() => setShowPassword(false)} /> : <Eye className="eye" onClick={() => setShowPassword(true)} />}
					</div>
					<p className={`${errors.password ? "visible" : "invisible"} text-red-600 font-bold`}>{errors.password?.message && t(errors.password.message)}!</p>
					<input className={`${errors.confirmPwd ? "border-red-600" : ""}`} type={showPassword ? "text" : "password"} placeholder={t("RESET_PASSWORD.CONFIRM_PASSWORD")} {...register("confirmPwd")} />
					<p className={`${errors.confirmPwd ? "visible" : "invisible"} ml-0.5 font-bold text-red-600`}>{errors.confirmPwd?.message && t(errors.confirmPwd.message)}!</p>
					<p className={`${errors.apiError ? "visible" : "invisible"} text-red-600 font-bold`}>{errors.apiError?.message && t(errors.apiError.message as string)}!</p>
					<Button type="submit" color="primary">
						{t("RESET_PASSWORD.CHANGE")}
					</Button>
				</form>
			</div>
		</section>
	);
};

export default ResetPasswordModal;
