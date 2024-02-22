import { Todo } from "types/todo-types";

export async function postTodo(todo: Todo) {
  const response = await fetch("http://localhost:8080/todos/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    console.error("ERROR", await response.text());
  }
}

export async function listTodos(): Promise<Todo[]> {
  const response = await fetch("http://localhost:8080/todos", {
    method: "GET",
  });
  return response.json();
}
