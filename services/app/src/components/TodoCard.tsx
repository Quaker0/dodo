import { DragEvent, useContext } from "react";
import { TodoTask } from "types/todo-types";
import DragIcon from "../assets/drag.png";
import TodoContext from "../lib/TodoContext";

type TodoCardProps = {
  todo: TodoTask | undefined;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    todo: TodoTask
  ) => Promise<void>;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: DragEvent<HTMLDivElement>, subTask?: boolean) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: DragEvent<HTMLDivElement>) => void;
  onSubTaskDrop: (e: DragEvent<HTMLDivElement>) => void;
};

export function TodoCard({
  todo,
  onChange,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
  onSubTaskDrop,
}: TodoCardProps) {
  if (!todo) {
    return;
  }
  return (
    <div
      id={todo.id}
      className="card clickable-card"
      draggable
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
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
            className="rounded-lg px-3 py-1 break-all"
            style={{ wordBreak: "break-word" }}
          >
            {todo?.subject}
          </label>
        </div>
        <div className="flex items-center min-w-[20px]">
          <img src={DragIcon} width="20" draggable={false} />
        </div>
        <div
          id={todo.id}
          className="card-click-box"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={onSubTaskDrop}
          onDragEnter={(e) => onDragEnter(e, true)}
        />
      </div>
    </div>
  );
}

export function RecursiveTodoCard(
  props: TodoCardProps & {
    child?: boolean;
  }
) {
  const { todos, todoLists } = useContext(TodoContext);
  const { todo } = props;
  if (!todo) {
    return;
  }
  const children = todoLists[todo.id]?.order;
  return (
    <>
      <div className="flex flex-row items-center gap-2">
        {props.child && "→"}
        <TodoCard {...props} />
      </div>
      {children &&
        children?.length > 0 &&
        children.map((childId) => (
          <div
            className="flex flex-col items-center pl-20 gap-3"
            key={`todo-card-${todo.id}-${childId}`}
          >
            <RecursiveTodoCard
              {...props}
              todo={todos[todo.listId][childId]}
              child
            />
          </div>
        ))}
    </>
  );
}
