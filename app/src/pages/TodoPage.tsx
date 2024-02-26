import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import TodoPanel from "../components/TodoPanel";
import TodoContext from "../lib/TodoContext";

export default function TodoPage() {
  const { listId } = useParams();
  const { socket, todos } = useContext(TodoContext);

  useEffect(() => {
    if (socket && listId) {
      console.log("join list", listId);
      socket
        .timeout(1000)
        .emitWithAck("joinList", listId)
        .then(({ success, err }) => {
          if (!success) {
            console.error("joinList success", success, err);
          }
        });
    }
  }, [listId, socket]);

  if (!listId) {
    console.log("empty", listId, todos);
    return;
  }
  return <TodoPanel todos={todos?.[listId]} listId={listId} />;
}
