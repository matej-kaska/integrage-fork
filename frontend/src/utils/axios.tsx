import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { removeUser } from "../redux/authSlice";
import { store } from "../redux/store";

const instance = axios.create();

instance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			store.dispatch(removeUser());
			console.warn("You must be logged in to perform this action!");
		}
		return Promise.reject(error);
	},
);

instance.interceptors.request.use(
	(config) => {
		const token = store.getState().auth.token;
		if (token) {
			config.headers.Authorization = `Token ${token}`;
		}
		const language = store.getState().language.language;
		if (language) {
			config.headers["Accept-Language"] = language;
		} else {
			config.headers["Accept-Language"] = document.documentElement.lang;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

type SuccessResponse<T> = {
	success: true;
	status: number;
	data: T;
};

type ErrorResponse = {
	success: false;
	status: number;
	message: {
		en: string;
		cz: string;
	};
};

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export const clearAxiosAuthorization = () => {
	instance.defaults.headers.common.Authorization = undefined;
};

const isValidErrorData = (value: any): value is { en: string; cz: string } => {
	return typeof value === "object" && value !== null && typeof value.en === "string" && typeof value.cz === "string";
};

const axiosRequest = async <T,>(method: "GET" | "POST" | "PUT" | "DELETE", url: string, data?: any, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
	try {
		const response = await instance.request<T>({ ...config, method, url, data });
		return {
			success: true,
			status: response.status,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError;
		const responseData = axiosError.response?.data;
		const errorData = isValidErrorData(responseData) && "en" in responseData && "cz" in responseData
			? responseData as { en: string; cz: string }
			: { en: "An unexpected error occurred", cz: "Došlo k neočekávané chybě" };

		return {
			success: false,
			status: axiosError.response?.status || 500,
			message: errorData,
		};
	}
};

export default axiosRequest;
