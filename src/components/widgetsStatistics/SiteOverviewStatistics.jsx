
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const StatCard = ({ title, value, meta }) => (
  <div className="col-xxl-3 col-md-6 mb-3">
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {/* value अब एक number या string होना चाहिए, object या array नहीं */}
            <div className="fs-5 fw-bold">{value ?? 0}</div>
            <div className="text-muted fs-13">{title}</div>
          </div>
          <div className="text-muted small text-end">
            <div>{meta}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TopPlayerCard = ({ player }) => (
  <div className="card h-100 shadow-sm">
    <div className="card-body text-center">
      <div className="mb-3">
        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto"
          style={{ width: 80, height: 80 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v2" />
          </svg>
        </div>
      </div>
      <h6 className="fw-bold mb-1">{player.p_name}</h6>
      <p className="text-muted small mb-2">Team: {player.team_name}</p>
      <div className="bg-success bg-opacity-10 text-success rounded p-2 mb-3">
        <div className="fw-bold fs-4">{player.Player_Behavior_Overall_Score}%</div>
        <div className="small">Overall Score</div>
      </div>
      <div className="d-flex gap-2 justify-content-center">
        <Link to={`/player-comparison/${player.p_id}`} className="btn btn-sm btn-outline-primary">
          View Stats
        </Link>
        <Link to={`/coach/evaluate/${player.p_id}`} className="btn btn-sm btn-outline-info">
          Evaluate
        </Link>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [topPlayer, setTopPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAfrica = user && user.u_region === "africa";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsRes = await fetch(`${BASE_URL}/api/coach/dashboard/stats`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!statsRes.ok) throw new Error(`Dashboard API ${statsRes.status}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch players with scores
      await fetchPlayersWithScores();

    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersWithScores = async () => {
    try {
      const playersRes = await fetch(`${BASE_URL}/api/coach/players`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!playersRes.ok) throw new Error(`Players API ${playersRes.status}`);

      const playersData = await playersRes.json();
      setPlayers(playersData);

      // Find player with highest score
      findTopPlayer(playersData);

    } catch (err) {
      console.error("Players load error:", err);
      setPlayers([]);
    }
  };

  const findTopPlayer = (playersData) => {
    if (!playersData || playersData.length === 0) {
      setTopPlayer(null);
      return;
    }

    // Filter out players with "N/A" or null scores and convert scores to numbers
    const validPlayers = playersData
      .filter(player => {
        const score = player.Player_Behavior_Overall_Score;
        return score !== "N/A" && score !== null && score !== undefined && !isNaN(score);
      })
      .map(player => ({
        ...player,
        Player_Behavior_Overall_Score: Number(player.Player_Behavior_Overall_Score)
      }));

    if (validPlayers.length === 0) {
      setTopPlayer(null);
      return;
    }

    // Sort by score descending and get the top player
    const sortedPlayers = validPlayers.sort((a, b) =>
      b.Player_Behavior_Overall_Score - a.Player_Behavior_Overall_Score
    );

    setTopPlayer(sortedPlayers[0]);
  };

  if (loading) return (
    <div className="container-fluid p-4 text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2">Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="container-fluid p-4">
      <div className="alert alert-danger">{error}</div>
    </div>
  );

  const isAdmin = stats?.role === "admin";

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2 className="fw-bold mb-0">{isAdmin ? 'Admin Dashboard' : 'Coach Dashboard'}</h2>
          <p className="text-muted mb-0">{isAdmin ? 'System overview' : 'Team performance & player insights'}</p>
        </div>
        <div className="col-auto">
          <div className="small text-muted">Last updated: {new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <StatCard title="Total Players" value={stats?.players} meta="Players" />

        {/* FIX: Use .length to get the count */}
        <StatCard
          title="Pending Evaluations"
          value={stats?.pendingEvaluations?.length ?? 0}
          meta="Pending"
        />


        {isAdmin ? (
          <>
            <StatCard title="Total Coaches" value={stats?.totalCoaches} meta="Coaches" />
            <StatCard title="Total Evaluations" value={stats?.totalEvaluations} meta="Evaluations" />
          </>
        ) : (
          <StatCard title="Total Evaluations" value={players.filter(p => p.team_id).length} meta="Active" />
        )}
      </div>

      {/* Main Content */}
      <div className="row g-4">
        {/* Top Player Highlight */}

        {/* All Players Grid */}
        {!isAdmin && players.length > 0 && (
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">Players</h5>
                <small className="text-muted">{players.length} total players</small>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {players
                    .map((player) => (
                      <div key={player.p_id} className="col-xl-3 col-lg-4 col-md-6">
                        <div className={`card h-100 ${topPlayer && player.p_id === topPlayer.p_id ? 'border-success border-2' : ''}`}>
                          <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-2">
                              <h6 className="fw-bold mb-0">{player.p_name}</h6>
                            </div>

                            <p className="text-muted small mb-2">
                              Team: {player.team_name || 'No Team'}
                            </p>

                            <p className="text-muted small mb-2">
                              Age: {player.p_age} | Email: {player.p_email}
                            </p>

                            <div className="mt-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small text-muted">Behavior Score:</span>
                                <span className="fw-bold text-primary">
                                  {player.Player_Behavior_Overall_Score === "N/A"
                                    ? "N/A"
                                    : `${Number(player.Player_Behavior_Overall_Score).toFixed(2)}%`}
                                </span>
                              </div>

                              <div className="d-flex gap-2 mt-3">
                                <Link
                                  to={`/player-comparison/${player.p_id}`}
                                  className="btn btn-sm btn-outline-primary flex-fill"
                                >
                                  Stats
                                </Link>

                                <Link
                                  to={`/coach/evaluate/${player.p_id}`}
                                  className="btn btn-sm btn-outline-info flex-fill"
                                >
                                  Evaluate
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Players Message */}
        {!isAdmin && players.length === 0 && (
          <div className="col-12">
            <div className="card text-center py-5">
              <div className="card-body">
                <div className="text-muted mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 20v-2a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v2" />
                  </svg>
                </div>
                <h5 className="text-muted">No Players Found</h5>
                <p className="text-muted">You haven't added any players yet.</p>
                <Link to="/coach/players" className="btn btn-primary">
                  Add Players
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Section */}
      {/* {isAdmin && stats?.loginAudit && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white">
                <h6 className="mb-0 fw-semibold">Recent Login Activity</h6>
              </div>
              <div className="card-body">
                {Array.isArray(stats.loginAudit) && stats.loginAudit.length ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.loginAudit.map((u, i) => (
                          <tr key={i}>
                            <td>{u.u_name}</td>
                            <td>{u.u_email}</td>
                            <td>
                              {u.last_login
                                ? new Date(u.last_login).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                                : "-"}
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted">No login data</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )} */}

      {isAdmin && stats?.loginAudit && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white text-white p-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-history me-2"></i>
                  Recent Login Activity
                </h5>
                {stats?.loginAudit?.length && (
                  <span className="badge bg-light text-primary">
                    Total {stats.loginAudit.length} Entries
                  </span>
                )}
              </div>
              <div className="card-body p-0">
                {Array.isArray(stats.loginAudit) && stats.loginAudit.length ? (
                  <div className="table-responsive">
                    <table className="table table-hover table-sm mb-0 align-middle">
                      <thead>
                        <tr>
                          <th className="text-muted fw-normal" style={{ width: '30%' }}>USER NAME</th>
                          <th className="text-muted fw-normal" style={{ width: '40%' }}>EMAIL ADDRESS</th>
                          <th className="text-muted fw-normal" style={{ width: '30%' }}>LAST LOGIN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.loginAudit.map((u, i) => (
                          <tr key={i}>
                            <td className="fw-semibold text-dark">{u.u_name}</td>
                            <td className="text-muted small">{u.u_email}</td>
                            <td>
                              <span className="badge bg-light text-dark fw-normal p-2">
                                {u.last_login ? (() => {
                                  const dateString = u.last_login;
                                  const lastLoginTime = new Date(dateString);
                                  const now = new Date();
                                  const diffInMinutes = Math.round((now - lastLoginTime) / (1000 * 60));

                                  if (diffInMinutes < 60) {
                                    return `${diffInMinutes} minutes ago`;
                                  } else if (diffInMinutes < 1440) { // 24 hours
                                    return `${Math.round(diffInMinutes / 60)} hours ago`;
                                  }

                                  // Standard long format for older dates
                                  return lastLoginTime.toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  });
                                })() : "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-lock-open fs-4 mb-2"></i>
                    <p className="mb-0">No recent login data available for display.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;