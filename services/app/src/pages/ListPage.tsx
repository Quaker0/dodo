import { useContext } from "react";
import { Link } from "react-router-dom";
import NewListCard from "../components/NewListCard";
import TodoContext from "../lib/TodoContext";

export default function ListPage() {
  const { todoLists, todos } = useContext(TodoContext);

  return (
    <div className="flex justify-center h-full flex-col items-center gap-5">
      <NewListCard />
      <div className="flex flex-col gap-2">
        {Object.values(todoLists)
          .filter((todoList) => todoList.grandfather)
          .map((todoList) => (
            <Link to={`/${todoList.id}`} key={todoList.id} draggable={false}>
              <div className="card flex flex-row justify-between">
                <div>{todoList?.title}</div>
                <div className="whitespace-nowrap">
                  {
                    Object.values(todos?.[todoList.id] || {}).filter(
                      (todo) => todo.checked
                    ).length
                  }
                  /{Object.values(todos?.[todoList.id] || {}).length}{" "}
                  <span className="text-[green]">✔</span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
