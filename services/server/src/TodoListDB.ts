import { TodoList } from "types/todo-types";

export default class TodoListDB {
  private todoLists: Record<string, TodoList> = {};

  get(listId: string) {
    return this.todoLists[listId];
  }

  set(todoList: TodoList) {
    this.todoLists[todoList.id] = todoList;
  }

  remove(listId: string) {
    delete this.todoLists[listId];
  }

  exists(listId: string) {
    return listId in this.todoLists;
  }

  addChildLink(listId: string, todoId: string, toOrderIdx = 0) {
    const newOrder = [...this.todoLists[listId].order];
    newOrder.splice(toOrderIdx, 0, todoId);
    this.todoLists[listId].order = newOrder;
  }

  removeChildLink(listId: string, todoId: string) {
    const idxToRemove = this.todoLists[listId].order?.indexOf(todoId);
    if (idxToRemove != null && idxToRemove >= 0) {
      this.todoLists[listId].order.splice(idxToRemove, 1);
    }
  }
}
