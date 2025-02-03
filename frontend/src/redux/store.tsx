import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import errorReducer, { errorHandlingMiddleware } from "./errorSlice";
import languageReducer from "./languageSlice";
import modalReducer from "./modalSlice";
import snackbarReducer from "./snackbarSlice";

const rootReducers = combineReducers({
	auth: authReducer,
	error: errorReducer,
	modal: modalReducer,
	snackbar: snackbarReducer,
	language: languageReducer,
});

export const store = configureStore({
	reducer: rootReducers,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(errorHandlingMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
