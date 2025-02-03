export type TUserInfo = {
	id: number | undefined;
	email: string | undefined;
	role: "user" | "analytic" | "admin" | undefined;
	first_name: string | undefined;
	last_name: string | undefined;
	is_staff: boolean | undefined;
};

export const blankUserInfo: TUserInfo = {
	id: undefined,
	email: undefined,
	role: undefined,
	first_name: undefined,
	last_name: undefined,
	is_staff: undefined,
};

export type UserData = (EmployedUserData | UnEmployedUserData) & {
	age: number;
	country: string;
	education: string;
	email: string;
	first_name: string;
	last_name: string;
	gender: string;
	id: number;
	residence: string;
	role: string;
};

type EmployedUserData = {
	employment: true;
	job_fields: string[];
	unemployed_months: null;
};

type UnEmployedUserData = {
	employment: false;
	job_fields: null;
	unemployed_months: number;
};
