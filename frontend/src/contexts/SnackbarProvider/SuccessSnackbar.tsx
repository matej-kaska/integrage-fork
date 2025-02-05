import Success from "images/snackbar-ok.svg?react";
import { onKeyDown } from "utils/onKeyDown";

type SuccessSnackbarProps = {
	message: string;
	fade: string;
	closeSnackbar: () => void;
};

const SuccessSnackbar = ({ message, fade, closeSnackbar }: SuccessSnackbarProps) => (
	<div className={`success-snackbar z-50 fixed top-0 max-w-auto whitespace-nowrap ${fade}`} onClick={closeSnackbar} onKeyDown={onKeyDown(closeSnackbar)}>
		<div className="border-t-4 p-green px-4 py-3 shadow-md">
			<div className="flex items-center">
				<Success />
				<p>{message}</p>
			</div>
		</div>
	</div>
);

export default SuccessSnackbar;
