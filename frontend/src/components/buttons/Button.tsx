type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	children?: React.ReactNode;
	color?: "primary" | "secondary" | "accent" | "reverse-accent";
	size?: "medium" | "large" | "small";
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	className?: string;
	type?: "button" | "submit" | "reset";
	uppercase?: boolean;
	onClick?: () => void;
};

const Button = ({ children, color = "accent", size = "medium", icon, iconPosition = "left", className, type = "button", uppercase = true, ...props }: ButtonProps) => {
	return (
		<button className={`button ${color} ${size} ${uppercase ? "uppercase" : ""} ${className && className}`} {...props} type={type}>
			{icon && iconPosition === "left" && <span className="button-icon mr-2">{icon}</span>}
			{children && children}
			{icon && iconPosition === "right" && <span className="button-icon ml-2">{icon}</span>}
		</button>
	);
};

export default Button;
