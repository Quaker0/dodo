import { Todo } from "types/todo-types";
import NewTodo from "./NewTodo";
import DisplayTodo from "./Todo";
import { postTodo } from "./lib/api";
import logo from "/dodo2.png";

export default function TodoPanel({ todos }: { todos: Todo[] }) {
  // socket.timeout(10000).emit()

  async function onClick(subject: string) {
    console.log("click");
    await postTodo({ subject });
  }

  return (
    <>
      <header>
        <div className="flex flex-row items-center m-3">
          <img src={logo} className="h-[4em] m-1" alt="Logo" />
          <h1>Dodo</h1>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center gap-3">
        {todos?.map((todo, idx) => (
          <DisplayTodo todo={todo} key={`todo-${idx}`} />
        ))}
        <NewTodo onClick={onClick} />
      </div>
    </>
  );
}
