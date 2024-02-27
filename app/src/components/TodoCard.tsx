import { Todo } from "types/todo-types";
import DragIcon from "../assets/drag.png";

type TodoCardProps = {
  todo: Todo | undefined;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    todo: Todo
  ) => Promise<void>;
};

export default function TodoCard({ todo, onChange }: TodoCardProps) {
  if (!todo) {
    return;
  }
  return (
    <div id={`todo-card-${todo.id}`} className="card clickable-card">
      <div className="flex justify-between">
        <div className="flex flex-row items-center gap-2 cursor-default px-2">
          <input
            type="checkbox"
            checked={todo.checked}
            onChange={(event) => onChange(event, todo)}
            id={`todo-checkbox-${todo.id}`}
          />
          <label
            htmlFor={`todo-checkbox-${todo.id}`}
            className="rounded-lg px-3 py-1"
          >
            {todo?.subject}
          </label>
        </div>
        <div className="flex items-center">
          <img src={DragIcon} width="20em" draggable={false} />
        </div>
      </div>
    </div>
  );
}
