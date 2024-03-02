import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import TodoPanel from "../components/TodoPanel";
import TodoContext from "../lib/TodoContext";
import { TodoTask } from "types/todo-types";

export default function TodoPage() {
  const { listId } = useParams();
  const { socket, todos } = useContext(TodoContext);

  useEffect(() => {
    if (socket && listId) {
      socket.joinList(listId, ({ success, err }) => {
        if (!success) {
          console.error("joinList success", success, err);
        }
      });
    }
  }, [listId, socket]);

  if (!listId) {
    return;
  }

  async function onNewTodoClick(subject: string) {
    if (socket && listId) {
      socket.sendNewTodo(listId, subject, ({ success, err }) => {
        if (!success) {
          console.error("newTodo", success, err);
        }
      });
    }
  }

  async function onTodoChangeClick(
    event: React.ChangeEvent<HTMLInputElement>,
    todo: TodoTask
  ) {
    if (socket && listId) {
      const updatedTodo = {
        ...todo,
        checked: event.target.checked,
      };
      socket.sendUpdatedTodo(listId, updatedTodo, ({ success, err }) => {
        if (!success) {
          console.error("setTodo", success, err);
        }
      });
    }
  }

  return (
    <TodoPanel
      todos={todos?.[listId]}
      onNewTodoClick={onNewTodoClick}
      onChangeTodoClick={onTodoChangeClick}
      listId={listId}
    />
  );
}
