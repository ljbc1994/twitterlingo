import { useState } from "react";

export default function Dashboard() {
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  return (
    <div>
      <div>
        <div>
          <button>My Account</button>
        </div>
        <div>
          <select>
            <option>Please select a language...</option>
          </select>
        </div>
      </div>
      <div>
        <div>
          <button onClick={() => setShowCompleted(false)}>To-do</button>
          <button onClick={() => setShowCompleted(true)}>Completed</button>
        </div>
        <hr />
        <div>
          {showCompleted ? (
            <div>
              <p>Here are the completed translations.</p>
            </div>
          ) : (
            <div>Here are the pending translations.</div>
          )}
        </div>
      </div>
    </div>
  );
}
