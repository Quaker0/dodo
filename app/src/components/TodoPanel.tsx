import { Todo, TodoList } from "types/todo-types";
import NewTodoCard from "./NewTodoCard";
import TodoCard from "./TodoCard";
import { getTodoList } from "../lib/api";
import { useContext, useEffect, useState } from "react";
import TodoContext from "../lib/TodoContext";

type TodoListProps = {
  todos: Todo[];
  listId: string | undefined;
};

export default function TodoPanel({ todos, listId }: TodoListProps) {
  const [todoList, setTodoList] = useState<TodoList>();
  const { socket } = useContext(TodoContext);

  useEffect(() => {
    if (listId) {
      getTodoList(listId).then((todoList) => setTodoList(todoList));
    }
  }, [listId]);

  async function onClick(subject: string) {
    if (socket && listId) {
      socket
        .timeout(1000)
        .emitWithAck("newTodo", listId, subject)
        .then(({ success, err }) => {
          if (!success) {
            console.error("newTodo", success, err);
          }
        });
    }
  }

  async function onChange(
    event: React.ChangeEvent<HTMLInputElement>,
    todo: Todo
  ) {
    console.log("updateTodo", !!socket, listId, event.target.checked);
    if (socket && listId) {
      socket
        .timeout(1000)
        .emitWithAck("updateTodo", listId, {
          ...todo,
          checked: event.target.checked,
        })
        .then(({ success, err }) => {
          if (!success) {
            console.error("setTodo", success, err);
          }
        });
    }
  }

  return (
    <>
      <h2>{todoList?.title}</h2>
      <div className="flex flex-col items-center justify-center gap-3">
        {todos?.map((todo, idx) => (
          <TodoCard todo={todo} onChange={onChange} key={`todo-${idx}`} />
        ))}
        <NewTodoCard onClick={onClick} />
      </div>
    </>
  );
}
