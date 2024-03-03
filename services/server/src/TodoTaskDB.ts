import { pick } from "lodash";
import { TodoTask } from "types/todo-types";

export default class TodoTasksDB {
  private todoTasks: Record<string, Record<string, TodoTask>> = {};

  get(listId: string, todoId: string) {
    return this.todoTasks[listId]?.[todoId];
  }

  list(listIds: string[]) {
    return pick(this.todoTasks, listIds);
  }

  set(todoTask: TodoTask) {
    if (!this.todoTasks[todoTask.listId]) {
      this.todoTasks[todoTask.listId] = {};
    }
    this.todoTasks[todoTask.listId][todoTask.id] = todoTask;
  }

  setParentId(listId: string, todoId: string, parentId: string) {
    const todoTask = this.get(listId, todoId);
    todoTask.parentId = parentId;
    this.set(todoTask);
  }
}
