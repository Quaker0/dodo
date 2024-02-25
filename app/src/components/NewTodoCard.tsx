import { useState } from "react";

type NewTodoProps = {
  onClick: (subject: string) => void;
};

export default function NewTodoCard({ onClick }: NewTodoProps) {
  const [subjectInput, setSubjectInput] = useState("");

  const validState = Boolean(subjectInput && subjectInput.replace(/\s/g, ""));

  return (
    <div className="card">
      <div className="flex flex-row items-center gap-2">
        <textarea
          className="rounded-lg px-3 py-1 flex-grow"
          value={subjectInput}
          onChange={(e) => {
            setSubjectInput(e.target.value);
          }}
        />
        <div>
          <button
            className={`button-round disabled:cursor-not-allowed  ${
              validState ? "" : "disabled"
            }`}
            onClick={() => {
              setSubjectInput("");
              onClick(subjectInput);
            }}
            disabled={!validState}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
