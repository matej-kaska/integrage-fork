import Info from "images/snackbar-info.svg?react";
import { onKeyDown } from "utils/onKeyDown";

type InfoSnackbarProps = {
	message: string;
	fade: string;
	closeSnackbar: () => void;
};

const InfoSnackbar = ({ message, fade, closeSnackbar }: InfoSnackbarProps) => (
	<div className={`info-snackbar z-50 fixed top-0 max-w-auto whitespace-nowrap ${fade}`} onClick={closeSnackbar} onKeyDown={onKeyDown(closeSnackbar)}>
		<div className="border-t-4 p-green px-4 py-3 shadow-md">
			<div className="flex items-center">
				<Info />
				<p>{message}</p>
			</div>
		</div>
	</div>
);

export default InfoSnackbar;
