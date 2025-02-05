import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { onKeyDown } from "utils/onKeyDown";
import { useModal } from "../../contexts/ModalProvider";
import useWindowSize from "../../utils/useWindowSize";

const UniversalModal = (props: PropsWithChildren) => {
	const { closeModal } = useModal();
	const ref = useRef<HTMLDivElement>(null);
	const windowSize = useWindowSize();
	const [height, setHeight] = useState<number>(0);

	const handleOutsideContentClick = () => {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.tagName === "INPUT") return;
		if (activeElement && activeElement.tagName === "TEXTAREA") return;
		const saveButton = document.querySelector<HTMLButtonElement>("#saveButton");
		if (saveButton) saveButton.click();

		closeModal();
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeModal();
		};

		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [closeModal]);

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setHeight(entry.contentRect.height);
			}
		});

		if (ref.current) {
			resizeObserver.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				resizeObserver.unobserve(ref.current);
			}
		};
	}, []);

	return (
		<aside className={`universal-modal ${height > windowSize?.[1] ? "flex-start" : ""}`} onClick={handleOutsideContentClick} onKeyDown={onKeyDown(handleOutsideContentClick)}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => onKeyDown(e.stopPropagation)} ref={ref}>
				{props.children}
			</div>
		</aside>
	);
};
export default UniversalModal;
