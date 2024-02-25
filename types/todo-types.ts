export type Todo = {
  id: string;
  subject: string;
  createdAt: number;
  checked: boolean;
};

export type TodoList = {
  id: string;
  title: string;
  createdAt: number;
};

export function isValidTodo(todo: Record<any, any>): todo is Todo {
  return (
    todo &&
    todo?.id &&
    todo?.subject &&
    "createdAt" in todo &&
    "checked" in todo
  );
}
