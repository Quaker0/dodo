import { Todo } from "types/todo-types";

type DisplayTodoProps = {
  todo: Todo;
};

export default function DisplayTodo({ todo: { subject } }: DisplayTodoProps) {
  return (
    <div className="card">
      <div className="flex flex-row items-center gap-2">
        <div>
          <p className="rounded-lg px-3 py-1">{subject}</p>
        </div>
      </div>
    </div>
  );
}
