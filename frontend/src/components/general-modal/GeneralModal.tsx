import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../contexts/ModalProvider";
import Button from "../buttons/Button";
import Eye from "images/eye.svg?react";
import EyeSlash from "images/eye-slash.svg?react";

export interface GeneralModalProps {
	text: string;
	actionOnClick?: (() => void) | undefined;
	input?: string;
	actionOnClickWparam?: (inputValue: string) => void;
	eye?: boolean;
}

const GeneralModal = ({ text, actionOnClick, input, actionOnClickWparam, eye=false }: GeneralModalProps) => {
	const { t } = useTranslation();
	const { closeModal } = useModal();
	const [inputValue, setInputValue] = useState<string>("");
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="general-modal">
			<h1>{text}</h1>
			{input && (
				<>
					<span>{input}</span>
					{eye ?
						<div className="password-wrapper">
							<input type={showPassword ? "text" : "password"} className="input" onChange={(e) => setInputValue(e.target.value)} />
							{showPassword ? <EyeSlash className="eye" onClick={() => setShowPassword(false)} /> : <Eye className="eye" onClick={() => setShowPassword(true)} />}
						</div>
					:
						<input type="password" className="input" onChange={(e) => setInputValue(e.target.value)} />
					}
					
				</>
			)}
			<div className="buttons">
				<Button color="reverse-accent" className="close-button" onClick={closeModal}>
					{t("SETTINGS.CANCEL")}
				</Button>
				{actionOnClickWparam ? (
					<Button color="accent" className="remove-button" onClick={() => actionOnClickWparam(inputValue)}>
						{t("SETTINGS.DELETE")}
					</Button>
				) : (
					<Button color="accent" className="remove-button" onClick={actionOnClick}>
						{t("SETTINGS.DELETE")}
					</Button>
				)}
			</div>
		</div>
	);
};

export default GeneralModal;
