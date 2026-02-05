import React, { useState } from "react";

const LinkedInPostComposer = ({ onPublish }) => {
  const [text, setText] = useState("");

  return (
    <div>
      <h3>Create LinkedIn Post</h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your post..."
        rows={4}
        style={{ width: "100%", padding: 10 }}
      />

      <button
        disabled={!text}
        onClick={() => onPublish(text)}
        style={{ marginTop: 10, padding: "10px 16px" }}
      >
        Publish
      </button>
    </div>
  );
};

export default LinkedInPostComposer;
