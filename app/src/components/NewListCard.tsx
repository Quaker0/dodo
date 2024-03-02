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
        className="flex-grow"
        type="text"
        onChange={(e) => {
          setNewListTitle(e.target.value);
        }}
        placeholder="Name your todo list"
      />
      <button
        className="button-large"
        disabled={!newListTitle}
        onClick={() => {
          if (socket) {
            socket.sendNewList(newListTitle, ({ success, err, id }) => {
              if (!success) {
                console.error(err);
              }
              if (id) {
                navigate(`/${id}`);
              }
            });
          }
        }}
      >
        + Create new list
      </button>
    </div>
  );
}
