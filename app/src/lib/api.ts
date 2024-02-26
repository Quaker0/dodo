import { Todo, TodoList } from "types/todo-types";

const SERVER_URL = "http://localhost:8080";

// export async function createTodo(listId: string, todo: { subject: string }) {
//   const response = await fetch(`${SERVER_URL}/lists/${listId}/todos/create`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(todo),
//   });
//   if (!response.ok) {
//     console.error("ERROR", await response.text());
//   }
// }

// export async function createTodoList(title: string) {
//   const response = await fetch(`${SERVER_URL}/lists/create`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ title }),
//   });
//   return response.json();
// }

export async function getTodoList(listId: string): Promise<TodoList> {
  const response = await fetch(`${SERVER_URL}/lists/${listId}`, {
    method: "GET",
  });
  return response.json();
}

// export async function listTodos(listId: string): Promise<Record<string, Todo>> {
//   const response = await fetch(`${SERVER_URL}/lists/${listId}/todos`, {
//     method: "GET",
//   });
//   return response.json();
// }

export async function listAllTodos(): Promise<
  Record<string, Record<string, Todo>>
> {
  const response = await fetch(`${SERVER_URL}/todos`, {
    method: "GET",
  });
  return response.json();
}
