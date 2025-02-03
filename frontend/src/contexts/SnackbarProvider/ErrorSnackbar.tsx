import ErrorIcon from "images/snackbar-error.svg?react";
import { onKeyDown } from "utils/onKeyDown";

type ErrorSnackbarProps = {
	message: string;
	fade: string;
	closeSnackbar: () => void;
};

const ErrorSnackbar = ({ message, fade, closeSnackbar }: ErrorSnackbarProps) => (
	<div className={`error-snackbar z-50 fixed top-0 max-w-auto whitespace-nowrap ${fade}`} onClick={closeSnackbar} onKeyDown={onKeyDown(closeSnackbar)}>
		<div className="border-t-4 p-green px-4 py-3 shadow-md">
			<div className="flex items-center">
				<ErrorIcon />
				<p>{message}</p>
			</div>
		</div>
	</div>
);

export default ErrorSnackbar;
