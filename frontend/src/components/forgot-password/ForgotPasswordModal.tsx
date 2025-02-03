import { yupResolver } from "@hookform/resolvers/yup";
import Button from "components/buttons/Button";
import { useModal } from "contexts/ModalProvider";
import { useSnackbar } from "contexts/SnackbarProvider";
import CloseIcon from "images/close.svg?react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import axiosRequest from "utils/axios";
import { emailSchema } from "utils/validationSchemas";
import * as yup from "yup";

type ForgotPasswordForm = {
	email: string;
	apiError?: any;
};

type APIResponse = {
	message: { en: string; cz: string };
};

const ForgotPasswordModal = () => {
	const { closeModal } = useModal();
	const { openSuccessSnackbar, openErrorSnackbar } = useSnackbar();
	const { t } = useTranslation();
	const [success, setSuccess] = useState(false);

	const handleSend = async (data: ForgotPasswordForm) => {
		setSuccess(false);
		const response = await axiosRequest<APIResponse>("POST", "/api/user/password/request", data);
		if (!response.success) {
			const message = t(`BACKEND-RESPONSES.${response.message.en}`);
			openErrorSnackbar(message);
			setError("apiError", { message: message });
			return;
		}
		openSuccessSnackbar(t("SNACKBAR.REQUEST_SENT"));
		setSuccess(true);
	};

	const formSchema = yup.object().shape({
		email: emailSchema,
	});

	const {
		setError,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordForm>({
		resolver: yupResolver(formSchema),
	});

	return (
		<section className="forgot-password-modal">
			<div className="top-wrapper">
				<CloseIcon onClick={closeModal} />
			</div>
			<div className="wrapper">
				<h3>{t("FORGOT_PASSWORD.TITLE")}</h3>
				<p>{t("FORGOT_PASSWORD.DESCRIPTION")}</p>
				<form onSubmit={handleSubmit(handleSend)}>
					<input className={`${errors.email ? "border-red-600" : ""}`} type="email" placeholder={t("FORGOT_PASSWORD.EMAIL")} {...register("email")} />
					{success ? (
						<p className="text-green-600 font-bold mt-2 mb-2">{t("FORGOT_PASSWORD.EMAIL_SENT")}</p>
					) : (
						<>
							<p className={`${errors.email ? "visible" : "invisible"} ml-0.5 font-bold text-red-600`}>{errors.email?.message && t(errors.email.message)}!</p>
							<p className={`${errors.apiError ? "visible" : "invisible"} text-red-600 font-bold`}>{errors.apiError?.message && t(errors.apiError.message as string)}!</p>
						</>
					)}
					<Button type="submit" color="primary">
						{t("FORGOT_PASSWORD.SEND")}
					</Button>
				</form>
			</div>
		</section>
	);
};

export default ForgotPasswordModal;
