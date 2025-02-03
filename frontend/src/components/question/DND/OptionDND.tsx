import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type OptionDNDProps = {
	id: number;
	text: string;
};

const OptionDND = ({ id, text }: OptionDNDProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		zIndex: isDragging ? 1000 : undefined,
		boxShadow: isDragging ? "0px 4px 6px rgba(0, 0, 0, 0.1)" : undefined,
	};

	return (
		<li ref={setNodeRef} style={style} className="option" {...attributes} {...listeners}>
			<label htmlFor={`option-${id}`}>{text}</label>
		</li>
	);
};

export default OptionDND;
