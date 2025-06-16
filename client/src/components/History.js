// client/src/components/History.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { decryptWithAES } from "../services/crypto";

export default function History() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getHistory();
        const rawEntries = res.data.entries; // array of { id, encryptedText, encryptedVector, createdAt }
        // Decrypt each entry
        const decrypted = rawEntries.map((e) => {
          let plainText = "";
          let vectorJSON = "";
          try {
            plainText = decryptWithAES(e.encryptedText);
            vectorJSON = decryptWithAES(e.encryptedVector);
          } catch (err) {
            console.error("Decryption error for entry", e.id, err);
            plainText = "[Error decrypting]";
            vectorJSON = "[Error decrypting vector]";
          }
          return {
            id: e.id,
            text: plainText,
            vector: JSON.parse(vectorJSON),
            createdAt: new Date(e.createdAt).toLocaleString(),
          };
        });
        setEntries(decrypted);
      } catch (err) {
        console.error("Failed to load history:", err);
        setError("Could not fetch history. Are you logged in?");
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="col-md-8 offset-md-2">
      <h2>Your Journal History</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        entries.map((e) => (
          <div key={e.id} className="card mb-3">
            <div className="card-body">
              <p className="card-text"><strong>Entry:</strong> {e.text}</p>
              <p className="card-text">
                <strong>Tags:</strong>{" "}
                {Object.entries(e.vector)
                  .filter(([k, v]) => v === 1)
                  .map(([k]) => k)
                  .join(", ") || "None"}
              </p>
              <p className="card-text">
                <small className="text-muted">{e.createdAt}</small>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
