import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import TodoPanel from "../components/TodoPanel";
import TodoContext from "../lib/TodoContext";

export default function TodoPage() {
  const { listId } = useParams();
  const { socket, todos } = useContext(TodoContext);

  useEffect(() => {
    if (socket && listId) {
      socket.joinList(listId, ({ success, err }) => {
        if (!success) {
          console.error("joinList success", success, err);
        }
      });
    }
  }, [listId, socket]);

  if (!listId) {
    return;
  }
  return <TodoPanel todos={todos?.[listId]} listId={listId} />;
}
