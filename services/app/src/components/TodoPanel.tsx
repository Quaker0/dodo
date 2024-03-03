import { DragEvent, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { TodoTask } from "types/todo-types";
import TodoContext from "../lib/TodoContext";
import NewTodoCard from "./NewTodoCard";
import { RecursiveTodoCard } from "./TodoCard";

type TodoListProps = {
  todos: Record<string, TodoTask> | undefined;
  listId: string | undefined;
  onNewTodoClick: (subject: string) => Promise<void>;
  onChangeTodoClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    todo: TodoTask
  ) => Promise<void>;
};

export default function TodoPanel({
  todos,
  listId,
  onNewTodoClick,
  onChangeTodoClick,
}: TodoListProps) {
  const { socket, lists } = useContext(TodoContext);

  const [dragItemId, setDragItemId] = useState<string>();
  const [dragOverItemId, setDragOverItemId] = useState<string>();

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    setDragItemId(e.currentTarget.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnter(e: DragEvent<HTMLDivElement>, subTask?: boolean) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    const dragOverElem = document.getElementById(e.currentTarget.id);
    if (dragOverElem) {
      removeDragHoverEffect(dragOverItemId);
      setDragOverItemId(e.currentTarget.id);
      if (subTask) {
        dragOverElem.classList.add("drag-hover-below");
      } else {
        dragOverElem.classList.add("drag-hover");
      }
    }
  }

  function removeDragHoverEffect(elementId: string | undefined) {
    if (elementId) {
      const oldDragOverElem = document.getElementById(elementId);
      if (oldDragOverElem) {
        oldDragOverElem.classList.remove("drag-hover", "drag-hover-below");
      }
    }
  }

  function handleDragDrop(e: DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();

    removeDragHoverEffect(dragItemId);
    removeDragHoverEffect(dragOverItemId);

    if (
      listId &&
      dragItemId &&
      dragOverItemId &&
      dragItemId !== dragOverItemId
    ) {
      let parentId = todos?.[dragOverItemId]?.parentId || todoList.id;
      if (parentId === dragItemId) {
        parentId = todos?.[dragItemId]?.parentId || todoList.id;
      }
      socket?.sendMoveTask(
        listId,
        dragItemId,
        parentId,
        lists[parentId].order.indexOf(dragOverItemId),
        ({ success, err }) => {
          if (!success) {
            console.error(err);
          }
        }
      );
    }
    setDragItemId(undefined);
    setDragOverItemId(undefined);
  }

  function handleSubTaskDragDrop(e: DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();

    if (
      listId &&
      dragItemId &&
      dragOverItemId &&
      dragItemId !== dragOverItemId
    ) {
      socket?.sendMoveTask(
        listId,
        dragItemId,
        dragOverItemId,
        0,
        ({ success, err }) => {
          if (!success) {
            console.error(err);
          }
        }
      );
      removeDragHoverEffect(dragOverItemId);
    }
  }

  function handleDragEnd() {
    removeDragHoverEffect(dragItemId);
    removeDragHoverEffect(dragOverItemId);
  }

  if (!listId || !lists[listId]) {
    if (lists) {
      return (
        <div className="text-center">Nothing here... keep on waddling</div>
      );
    }
    // Not received the todo lists yet
    return;
  }

  const todoList = lists[listId];

  return (
    <div className="flex flex-col items-center gap-3">
      <div>
        <Link to="/" className="text-[darkblue] mr-1">
          All Todo Lists
        </Link>
        &gt; {todoList?.title}
      </div>
      <h2>{todoList?.title}</h2>
      <NewTodoCard onClick={onNewTodoClick} />
      <div className="flex flex-col items-center justify-center gap-3">
        {todoList.order.map((todoId) => (
          <RecursiveTodoCard
            todo={todos?.[todoId]}
            onChange={onChangeTodoClick}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDrop={handleDragDrop}
            onDragEnd={handleDragEnd}
            onSubTaskDrop={handleSubTaskDragDrop}
            key={`todo-card-${listId}-${todoId}`}
          />
        ))}
      </div>
    </div>
  );
}
