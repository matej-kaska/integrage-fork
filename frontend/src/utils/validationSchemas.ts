import * as yup from "yup";

export const emailSchema = yup
	.string()
	.required("VALIDATION.REQUIRED")
	.email("VALIDATION.EMAIL")
	.matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "VALIDATION.EMAIL")
	.max(320, "VALIDATION.EMAIL");

export const passwordSchema = yup.string().required("VALIDATION.REQUIRED").min(8, "VALIDATION.PASSWORD_MIN").max(100, "VALIDATION.PASSWORD_MAX");

export const rememberMeSchema = yup.boolean();

export const firstNameSchema = yup.string().required("VALIDATION.REQUIRED").max(100, "VALIDATION.FIRST_NAME_MAX");

export const lastNameSchema = yup.string().required("VALIDATION.REQUIRED").max(100, "VALIDATION.LAST_NAME_MAX");

export const locationSchema = yup.string().required("VALIDATION.REQUIRED").max(100, "VALIDATION.LOCATION_MAX");

export const confirmPasswordSchema = yup
	.string()
	.required("VALIDATION.REQUIRED")
	.oneOf([yup.ref("password")], "VALIDATION.CONFIRM_PASSWORD");

export const gdprSchema = yup.boolean().required().oneOf([true], "VALIDATION.GDPR");

export const ageSchema = yup.number().typeError("VALIDATION.REQUIRED").required("VALIDATION.REQUIRED").min(0, "VALIDATION.REQUIRED").max(150, "VALIDATION.AGE_MAX");

export const confirmNewPasswordSchema = yup
	.string()
	.required("VALIDATION.REQUIRED")
	.oneOf([yup.ref("newPassword")], "VALIDATION.CONFIRM_PASSWORD");
