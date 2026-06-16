import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

// Same fields the coach can edit on the Comparison page's "Edit Stats" modal
const statFields = [
  { key: "matches", label: "Matches Played" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "shots", label: "Shots" },
  { key: "shots_on_goal", label: "Shots On Goal" },
  { key: "big_chances", label: "Big Chances" },
  { key: "key_passes", label: "Key Passes" },
  { key: "tackles", label: "Tackles" },
  { key: "pass_completion_pct", label: "Pass %" },
  { key: "minutes", label: "Minutes" },
  { key: "cautions", label: "Cautions" },
  { key: "ejections", label: "Ejections" },
  { key: "progressive_carries", label: "Progressive Carries" },
  { key: "defensive_actions", label: "Defensive Actions" },
];

const PlayerStatsForm = () => {
  const { id: playerId } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const verifyAndLoad = async () => {
      if (!playerId || !token) {
        setError("Invalid stats link.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${BASE_URL}/api/public/stats/verify?player=${playerId}&token=${token}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Invalid or expired link.");
          setLoading(false);
          return;
        }

        setPlayerName(data.playerName || "");
        setFormData(data.stats || {});
      } catch {
        setError("Failed to verify link.");
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [playerId, token]);

  const handleChange = (key, value) => {
    const processed = key === "matches" ? parseInt(value) || 0 : parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [key]: processed }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const res = await fetch(`${BASE_URL}/api/public/stats/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: Number(playerId), token, ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit stats.");
        return;
      }

      setSubmitted(true);
    } catch {
      alert("Failed to submit stats. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="card p-5 text-center shadow">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5 text-primary">Loading stats form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger p-4 shadow-sm" role="alert">
          <h4 className="alert-heading">Error Loading Form</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mt-5">
        <div className="card shadow-lg border-0 p-5 text-center bg-light">
          <div className="display-4 text-success mb-3">✅</div>
          <h2 className="text-dark mb-3">Thank You!</h2>
          <p className="lead text-success fw-bold">Your stats have been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div
        className="card shadow-lg border-0 p-0"
        style={{ maxWidth: "700px", margin: "0 auto", borderRadius: "10px" }}
      >
        <div className="card-header bg-primary text-white p-3 rounded-top">
          <h4 className="mb-1 fw-bold">Edit Player Statistics (Raw Totals)</h4>
          {playerName && <small>Player: {playerName}</small>}
        </div>

        <div className="card-body p-4">
          <table className="table table-striped table-hover">
            <thead className="bg-dark text-white">
              <tr>
                <th>Stat</th>
                <th className="text-center">Actual Value</th>
              </tr>
            </thead>
            <tbody>
              {statFields.map(({ key, label }) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td className="text-center">
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      value={formData[key] ?? 0}
                      onChange={(e) => handleChange(key, e.target.value)}
                      min="0"
                      step={key === "matches" ? "1" : "any"}
                      disabled={submitting}
                      style={{ width: "120px", margin: "0 auto" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-success px-5" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsForm;
