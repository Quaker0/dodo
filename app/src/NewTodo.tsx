import { useState } from "react";

type NewTodoProps = {
  onClick: (subject: string) => void;
};

export default function NewTodo({ onClick }: NewTodoProps) {
  const [subjectInput, setSubjectInput] = useState("");

  return (
    <div className="card">
      <div className="flex flex-row items-center gap-2">
        <div>
          <textarea
            className="rounded-lg px-3 py-1"
            onChange={(e) => {
              setSubjectInput(e.target.value);
            }}
          ></textarea>
        </div>
        <div>
          <button onClick={() => onClick(subjectInput)}>+</button>
        </div>
      </div>
    </div>
  );
}
