import { Todo, TodoList } from "types/todo-types";

const SERVER_URL = "http://localhost:3000";

export async function getTodoList(listId: string): Promise<TodoList> {
  const response = await fetch(`${SERVER_URL}/lists/${listId}`, {
    method: "GET",
  });
  return response.json();
}

export async function listAllTodos(): Promise<
  Record<string, Record<string, Todo>>
> {
  const response = await fetch(`${SERVER_URL}/todos`, {
    method: "GET",
  });
  return response.json();
}
