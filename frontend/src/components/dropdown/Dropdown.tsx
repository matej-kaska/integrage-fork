import { Menu, Transition } from "@headlessui/react";
import Arrow from "images/arrow.svg?react";
import { type ButtonHTMLAttributes, Fragment, type PropsWithChildren, type ReactNode } from "react";

type DropdownProps = PropsWithChildren<any> & {
	label?: string | ReactNode;
	disabled?: boolean;
	upPlacement?: boolean;
	className?: string;
	noArrow?: boolean;
	defaultClasses?: boolean;
	menuMiddle?: boolean;
	menuClasses?: string;
	svg?: ReactNode;
	preLabel?: string;
	id?: string;
	ariaLabel?: string;
};

const Dropdown = ({ label, disabled, upPlacement, className, noArrow, defaultClasses = true, menuMiddle, menuClasses, children, svg, preLabel, id, ariaLabel, ...props }: DropdownProps) => {
	return (
		<div className="dropdown relative inline-block">
			<Menu as="div" {...props}>
				<Menu.Button
					disabled={disabled}
					id={id}
					className={`${
						defaultClasses
							? "select-none text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 whitespace-nowrap disabled:hover:bg-white dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700 group flex h-min items-center justify-center text-center font-medium focus:z-10 rounded-lg text-sm p-2"
							: ""
					} ${disabled ? "!cursor-not-allowed opacity-50" : ""} ${className ? className : ""}`}
					type="button"
					aria-label={ariaLabel}
				>
					{preLabel}
					{svg}
					{label && <span>{label}</span>}

					{noArrow ? "" : <Arrow className={`ml-2 h-3 ${upPlacement ? "rotate-90" : "-rotate-90"} arrow`} />}
				</Menu.Button>

				<Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
					<Menu.Items className={`panel ${upPlacement ? "bottom-[50px] origin-bottom" : ""} ${menuClasses ? menuClasses : ""} absolute flex flex-col mt-2 w-max rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 select-none ${menuMiddle ? "left-[50%] translate-x-[-50%]" : ""}`}>
						{children}
					</Menu.Items>
				</Transition>
			</Menu>
		</div>
	);
};

const DropdownItem = ({ children, className, defaultClasses = true, disabled = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & DropdownProps) => {
	return (
		<Menu.Item {...props}>
			{({ active }) => (
				<button className={`${disabled ? "!cursor-not-allowed opacity-50" : ""} ${active ? "" : ""} ${defaultClasses ? "flex items-center w-full text-left p-5 select-none" : ""} ${className ? className : ""}`} type="button">
					{children}
				</button>
			)}
		</Menu.Item>
	);
};

Dropdown.Item = DropdownItem;

export default Dropdown;
