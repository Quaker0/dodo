import { TodoTask, TodoList } from "types/todo-types";
import { uid } from "uid";

export class List implements TodoList {
  id: string;
  order: string[] = [];
  main = true;

  constructor(public title: string) {
    this.id = uid();
  }
}

export class Todo implements TodoTask {
  public id: string;

  constructor(
    public listId: string,
    public subject: string,
    public checked: boolean,
    public parentId?: string
  ) {
    if (!this.id) {
      this.id = uid(6);
    }
  }

  static isValid(todo: TodoTask) {
    return (
      todo.id &&
      todo.subject &&
      typeof todo.subject === "string" &&
      typeof todo.checked === "boolean"
    );
  }

  isValid() {
    return Todo.isValid(this);
  }
}
