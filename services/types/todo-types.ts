export type TodoTask = {
  id: string;
  listId: string;
  subject: string;
  checked: boolean;
  parentId?: string;
};

export type TodoList = {
  id: string;
  order: string[];
  title?: string;
  main?: boolean;
};
