import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import TodoContext from "../lib/TodoContext";

export default function NewListCard() {
  const navigate = useNavigate();
  const { socket } = useContext(TodoContext);
  const [newListTitle, setNewListTitle] = useState("");

  return (
    <div className="card flex flex-row gap-2">
      <input
        type="text"
        onChange={(e) => {
          setNewListTitle(e.target.value);
        }}
      />
      <button
        className="button-large"
        onClick={() => {
          socket
            ?.timeout(1000)
            .emitWithAck("createTodoList", newListTitle)
            .then(({ id }) => {
              navigate(`/${id}`);
            });
        }}
      >
        + Create new list
      </button>
    </div>
  );
}
