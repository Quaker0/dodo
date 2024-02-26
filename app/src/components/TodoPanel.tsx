import { DragEvent, useContext, useEffect, useState } from "react";
import { Todo, TodoList } from "types/todo-types";
import TodoContext from "../lib/TodoContext";
import { getTodoList } from "../lib/api";
import NewTodoCard from "./NewTodoCard";
import TodoCard from "./TodoCard";

type TodoListProps = {
  todos: Record<string, Todo> | undefined;
  listId: string | undefined;
};

export default function TodoPanel({ todos, listId }: TodoListProps) {
  const [todoList, setTodoList] = useState<TodoList>();
  const [todoOrder, setTodoOrder] = useState<string[]>([]);
  const { socket } = useContext(TodoContext);

  useEffect(() => {
    if (listId) {
      getTodoList(listId).then((todoList) => setTodoList(todoList));
    }
  }, [listId]);

  useEffect(() => {
    if (todos) {
      setTodoOrder(Object.values(todos).map((t) => t.id));
    }
  }, [todos]);

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

  const [dragItemId, setDragItemId] = useState<string>();
  const [dragOverItemId, setDragOverItemId] = useState<string>();

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    setDragItemId(e.currentTarget.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnter(e: DragEvent<HTMLDivElement>) {
    e.dataTransfer.effectAllowed = "move";
    e.preventDefault();
    e.stopPropagation();
    const dragOverElem = document.getElementById(e.currentTarget.id);
    if (dragOverElem && dragOverItemId !== e.currentTarget.id) {
      removeDragHoverEffect(dragOverItemId);
      dragOverElem.classList.add("drag-hover");
      setDragOverItemId(e.currentTarget.id);
    }
  }

  function removeDragHoverEffect(elementId: string | undefined) {
    if (elementId) {
      const oldDragOverElem = document.getElementById(elementId);
      if (oldDragOverElem) {
        oldDragOverElem.classList.remove("drag-hover");
      }
    }
  }

  function handleDragDrop(e: DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();

    removeDragHoverEffect(dragItemId);
    removeDragHoverEffect(dragOverItemId);

    if (dragItemId && dragOverItemId && dragItemId !== dragOverItemId) {
      const newTodoOrder = [...todoOrder];
      const moveFrom = newTodoOrder.indexOf(dragItemId);
      const moveTo = newTodoOrder.indexOf(dragOverItemId);
      newTodoOrder.splice(moveFrom, 1);
      newTodoOrder.splice(moveTo, 0, dragItemId);
      setTodoOrder(newTodoOrder);
      const dragOverElem = document.getElementById(e.currentTarget.id);
      if (dragOverElem) {
        dragOverElem.classList.remove("drag-hover");
      }
    }
    setDragItemId(undefined);
    setDragOverItemId(undefined);
  }

  function handleDragEnd() {
    removeDragHoverEffect(dragItemId);
    removeDragHoverEffect(dragOverItemId);
  }

  return (
    <>
      <h2>{todoList?.title}</h2>
      <div className="flex flex-col items-center justify-center gap-3">
        {todoOrder?.map((todoId) => (
          <div
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={handleDragDrop}
            onDragEnd={handleDragEnd}
            draggable
            id={todoId}
            key={`todo-card-${todoId}`}
          >
            <TodoCard todo={todos?.[todoId]} onChange={onChange} />
          </div>
        ))}
        <NewTodoCard onClick={onClick} />
      </div>
    </>
  );
}
