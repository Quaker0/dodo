import { Todo } from "types/todo-types";

type DisplayTodoProps = {
  todo: Todo;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    todo: Todo
  ) => Promise<void>;
};

export default function TodoCard({ todo, onChange }: DisplayTodoProps) {
  return (
    <div className="card clickable-card">
      <div className="flex flex-row items-center gap-2">
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
    </div>
  );
}
