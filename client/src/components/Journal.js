// client/src/components/Journal.js
import React, { useState } from "react";
import api from "../services/api";
import { encryptWithAES } from "../services/crypto";

export default function Journal() {
  const [text, setText] = useState("");
  const [tags, setTags] = useState({
    hopeless: false,
    anxious: false,
    suicidal: false,
    fine: false
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  function handleTagChange(e) {
    const { name, checked } = e.target;
    setTags((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // 1. Construct a sentiment vector (as an object)
    const vectorObj = {
      hopeless: tags.hopeless ? 1 : 0,
      anxious: tags.anxious ? 1 : 0,
      suicidal: tags.suicidal ? 1 : 0,
      fine: tags.fine ? 1 : 0,
    };

    // 2. Turn it into a JSON string (e.g. '{"hopeless":1,"anxious":0,...}')
    const vectorJSON = JSON.stringify(vectorObj);

    // 3. Encrypt both text & vectorJSON
    let encryptedText, encryptedVector;
    try {
      encryptedText = encryptWithAES(text || "");
      encryptedVector = encryptWithAES(vectorJSON);
    } catch (err) {
      console.error("Encryption error:", err);
      setError("Failed to encrypt. Are you still logged in?");
      return;
    }

    // 4. POST to /api/journal
    try {
      await api.submitJournalEntry(encryptedText, encryptedVector);
      setMessage("Entry saved!");
      setText("");
      setTags({ hopeless: false, anxious: false, suicidal: false, fine: false });
    } catch (err) {
      console.error("Submit journal error:", err);
      setError("Failed to save entry.");
    }
  }

  return (
    <div className="col-md-8 offset-md-2">
      <h2>New Journal Entry</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="journalText" className="form-label">
            How are you feeling right now?
          </label>
          <textarea
            id="journalText"
            className="form-control"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Select all that apply:</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="hopeless"
              id="tagHopeless"
              checked={tags.hopeless}
              onChange={handleTagChange}
            />
            <label className="form-check-label" htmlFor="tagHopeless">
              Hopeless
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="anxious"
              id="tagAnxious"
              checked={tags.anxious}
              onChange={handleTagChange}
            />
            <label className="form-check-label" htmlFor="tagAnxious">
              Anxious
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="suicidal"
              id="tagSuicidal"
              checked={tags.suicidal}
              onChange={handleTagChange}
            />
            <label className="form-check-label" htmlFor="tagSuicidal">
              Suicidal Thoughts
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="fine"
              id="tagFine"
              checked={tags.fine}
              onChange={handleTagChange}
            />
            <label className="form-check-label" htmlFor="tagFine">
              Fine
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Entry
        </button>
      </form>
    </div>
  );
}
