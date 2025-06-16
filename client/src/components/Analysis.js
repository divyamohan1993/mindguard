// client/src/components/Analysis.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { decryptWithAES } from "../services/crypto";

export default function Analysis() {
  const [riskScore, setRiskScore] = useState(null);
  const [entriesCount, setEntriesCount] = useState(0);
  const [error, setError] = useState(null);

  // Define weights
  const weights = {
    hopeless: 3,
    anxious: 1,
    suicidal: 10,
    fine: 0,
  };

  // Threshold for urgent alert
  const THRESHOLD = 10;

  useEffect(() => {
    async function runAnalysis() {
      try {
        const res = await api.getHistory();
        const rawEntries = res.data.entries;
        let totalScore = 0;

        // For each entry, decrypt the vector, sum weighted points
        rawEntries.forEach((e) => {
          try {
            const vectorJSON = decryptWithAES(e.encryptedVector);
            const vec = JSON.parse(vectorJSON);
            // weighted dot product
            Object.entries(vec).forEach(([k, v]) => {
              if (weights[k] && v === 1) {
                totalScore += weights[k];
              }
            });
          } catch (err) {
            console.error("Failed to decrypt vector for analysis", e.id, err);
          }
        });

        setRiskScore(totalScore);
        setEntriesCount(rawEntries.length);
      } catch (err) {
        console.error("Analysis fetch error:", err);
        setError("Could not fetch entries for analysis.");
      }
    }

    runAnalysis();
  }, []);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (riskScore === null) {
    return <p>Calculating risk score...</p>;
  }

  return (
    <div className="col-md-8 offset-md-2">
      <h2>Your Risk Analysis</h2>
      <p>
        You have <strong>{entriesCount}</strong> journal entr{entriesCount === 1 ? "y" : "ies"}.
      </p>
      <p>
        <strong>Calculated Risk Score:</strong> {riskScore}
      </p>
      {riskScore >= THRESHOLD ? (
        <div className="alert alert-warning">
          <h4 className="alert-heading">⚠️ Crisis Alert</h4>
          <p>
            Your risk score is high (≥ {THRESHOLD}). We recommend contacting a trusted friend or
            mental health professional immediately. If you feel unsafe, please call your local
            crisis line now.
          </p>
        </div>
      ) : (
        <div className="alert alert-success">
          Your risk score is below {THRESHOLD}. Keep journaling and remember, it’s okay to not be
          okay.
        </div>
      )}
    </div>
  );
}
