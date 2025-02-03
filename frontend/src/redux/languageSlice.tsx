import { createSlice } from "@reduxjs/toolkit";

export const appSettingsSlice = createSlice({
	name: "appSettings",
	initialState: {
		language: "en",
	},
	reducers: {
		setLanguage: (state, action) => {
			state.language = action.payload;
		},
	},
});

export const { setLanguage } = appSettingsSlice.actions;

export default appSettingsSlice.reducer;
