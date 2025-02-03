import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import OptionDND from "./OptionDND";

type OptionsDNDProps = {
	question: QuestionDND;
	updateQuestion: (questionId: number, answer: number | number[] | string) => void;
};

const OptionsDND = ({ question, updateQuestion }: OptionsDNDProps) => {
	if (!question.dnd_options) return null;

	const [items, setItems] = useState<number[]>(question.dnd_options.map((option) => option.id));

	useEffect(() => {
		if (!question.dnd_options) return;
		if (question.type === "DND" && question.answered && question.answered.length > 0) {
			setItems(question.answered);
		} else {
			setItems(question.dnd_options.map((option) => option.id));
			updateQuestion(
				question.id,
				question.dnd_options.map((option) => option.id),
			);
		}
	}, [question]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: any) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = items.indexOf(active.id);
			const newIndex = items.indexOf(over.id);

			const newItems = arrayMove(items, oldIndex, newIndex);

			setItems(newItems);

			updateQuestion(question.id, newItems);
		}
	};

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={items} strategy={verticalListSortingStrategy}>
				<ul className="options-dnd">
					{items.map((itemId) => {
						const option = question.dnd_options?.find((option) => option.id === itemId);
						return <OptionDND key={itemId} id={itemId} text={option ? option.text : ""} />;
					})}
				</ul>
			</SortableContext>
		</DndContext>
	);
};

export default OptionsDND;
