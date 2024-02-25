import { useContext } from "react";
import { Link } from "react-router-dom";
import NewListCard from "../components/NewListCard";
import TodoContext from "../lib/TodoContext";

export default function ListPage() {
  const { todoLists } = useContext(TodoContext);
  console.log("ListPage todoLists", JSON.stringify(todoLists));

  return (
    <div className="flex justify-center h-full flex-col items-center gap-5">
      <NewListCard />
      <div className="flex flex-col gap-2">
        {Object.entries(todoLists).map(([todoListId, todoList]) => (
          <Link to={`/${todoListId}`} key={todoListId}>
            <div className="card">
              <div>{todoList?.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
