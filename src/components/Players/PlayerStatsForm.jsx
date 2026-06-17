import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

// Same fields the coach can edit on the Comparison page's "Edit Stats" modal
const statFields = [
  { key: "matches",            label: "Matches",             desc: "Total matches played during a season" },
  { key: "goals",              label: "Goals",               desc: "The total number of goals scored by a player in a season" },
  { key: "assists",            label: "Assists",             desc: "Passes that directly lead to a goal being scored in a season" },
  { key: "shots",              label: "Shots",               desc: "The total number of attempts a player makes to score, including shots on target and those that miss the goal in a season" },
  { key: "shots_on_goal",      label: "Shots On Goal",       desc: "The number of shots that are on target, meaning they would have resulted in a goal if not saved by the goalkeeper in a season" },
  { key: "big_chances",        label: "Big Chances",         desc: "Situations where a player is expected to score, typically in one-on-one scenarios or from very close range. This includes penalties in a season" },
  { key: "key_passes",         label: "Key Passes",          desc: "Passes that lead directly to a shot on goal, indicating a player's ability to create scoring opportunities in a season" },
  { key: "tackles",            label: "Tackles",             desc: "Defensive actions where a player attempts to take the ball away from an opponent. This can be categorized into tackles won and tackles lost in a season" },
  { key: "pass_completion_pct",label: "Pass %",              desc: "The ratio of successful passes to total passes attempted, indicating a player's passing accuracy in a season" },
  { key: "minutes",            label: "Minutes",             desc: "The total time a player spends on the field during matches, which can be crucial for evaluating their overall contribution in a season" },
  { key: "cautions",           label: "Cautions",            desc: "Yellow cards received by a player, which can impact their availability for future matches in a season" },
  { key: "ejections",          label: "Ejections",           desc: "Red cards received by a player, which can impact their availability for future matches in a season" },
  { key: "progressive_carries",label: "Progressive Carries", desc: "Instances where a player carries the ball forward more than five meters, contributing to the team's attacking play in a season" },
  { key: "defensive_actions",  label: "Defensive Actions",   desc: "Includes tackles, interceptions, and blocks made by a player, reflecting their defensive contributions in a season" },
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
              {statFields.map(({ key, label, desc }) => (
                <tr key={key}>
                  <td>
                    <span className="fw-bold">{label}</span>
                    {desc && <div className="text-muted fw-normal" style={{ fontSize: "0.78rem" }}>{desc}</div>}
                  </td>
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
