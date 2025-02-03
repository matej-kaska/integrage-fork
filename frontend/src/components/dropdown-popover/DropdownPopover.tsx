import { Popover, Transition } from "@headlessui/react";
import type React from "react";
import { Fragment, type ReactNode } from "react"

type DropdownPopoverProps = {
	buttonChildren: ReactNode;
	panelChildren: (props: { close: () => void }) => ReactNode;
	buttonClassName?: string;
	panelClassName?: string;
	text?: string;
	className?: string;
	buttonDisabled?: boolean;
	buttonRef?: React.RefObject<HTMLButtonElement>;
};

/* Dropdown that doesn't close after you click some item in it. */
const DropdownPopover = ({ className = "", buttonChildren, panelChildren, buttonClassName = "", panelClassName = "", buttonDisabled = false, buttonRef }: DropdownPopoverProps) => {
	return (
		<Popover className={`dropdown-popover ${className}`}>
			{({ open, close }) => (
				<>
					<Popover.Button className={`button ${buttonClassName} ${buttonDisabled ? "disabled" : ""} ${open ? "opened" : ""}`} disabled={buttonDisabled} type="button" ref={buttonRef}>
						{buttonChildren}
					</Popover.Button>

					<Transition show={open} as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-0" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-0">
						<Popover.Panel className={`panel font-14 absolute z-10 bg-white w-full select-none ${panelClassName}`}>{panelChildren({ close })}</Popover.Panel>
					</Transition>
				</>
			)}
		</Popover>
	);
};

export default DropdownPopover;
