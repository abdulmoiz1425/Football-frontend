import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ExcelJS from 'exceljs'
import CustomersHeader from '@/components/Players/PlayersHeader'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import topTost, { topTostError } from '../utils/topTost';



const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const Comparison = () => {
    const { id: playerId } = useParams();
    const navigate = useNavigate();

    const [comparisonData, setComparisonData] = useState(null);
    const [loadingComparison, setLoadingComparison] = useState(true);
    const [error, setError] = useState("");

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [saving, setSaving] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

    const [expectedGoals, setExpectedGoals] = useState(null);
    const [expectedGoalsError, setExpectedGoalsError] = useState("");

    const [probabilities, setProbabilities] = useState(null);
    const [selectedProbStat, setSelectedProbStat] = useState("goals");

    const [sendingLink, setSendingLink] = useState(false);
    const [downloading, setDownloading] = useState(false);


    useEffect(() => {
        loadComparisonData();
    }, [playerId]);

    const loadComparisonData = async () => {
        setLoadingComparison(true);
        try {
            const token = localStorage.getItem("authToken");

            const res = await fetch(
                `${BASE_URL}/api/coach/stats/stats/avg/${playerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const json = await res.json();

            if (!res.ok) throw new Error("Failed to load stats");

            // SAFE FALLBACKS
            setComparisonData({
                player: json.player || {},
                team: json.team || {},
                rawPlayer: json.rawPlayer || {},
                rawTeam: json.rawTeam || {},
            });

            // Initialize editedData with raw player stats (includes 'matches')
            setEditedData(json.rawPlayer || {});

        } catch (err) {
            setError("Failed to load comparison data: " + err.message);
        } finally {
            setLoadingComparison(false);
        }

        loadExpectedGoals();
        loadProbabilities();
    };

    const loadExpectedGoals = async () => {
        try {
            const token = localStorage.getItem("authToken");

            const res = await fetch(
                `${BASE_URL}/api/coach/stats/expected-goals/${playerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const json = await res.json();

            if (!res.ok) {
                setExpectedGoals(null);
                setExpectedGoalsError(json.message || "Failed to load expected goals");
                return;
            }

            setExpectedGoalsError("");
            setExpectedGoals(json);
        } catch (err) {
            setExpectedGoals(null);
            setExpectedGoalsError("Failed to load expected goals: " + err.message);
        }
    };

    const loadProbabilities = async () => {
        try {
            const token = localStorage.getItem("authToken");

            const res = await fetch(
                `${BASE_URL}/api/coach/stats/probability/${playerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const json = await res.json();

            if (!res.ok) {
                setProbabilities(null);
                return;
            }

            setProbabilities(json);
        } catch (err) {
            setProbabilities(null);
        }
    };

    const getPercentageDiff = (playerVal, teamVal) => {
        const p = parseFloat(playerVal) || 0;
        const t = parseFloat(teamVal) || 0;

        // Minutes is not compared to team average minutes
        if (t === 0 || p === 0) return 0;
        
        // This calculates player average / team average
        // For stats like cautions or ejections, a lower number is better, but the comparison here
        // simply shows the ratio to the team average.
        return ((p / t) * 100).toFixed(1);
    };

    // Predicted goals for the next match: the player's average goals per
    // match (Poisson lambda), rounded to a whole number
    const getPredictedGoals = () => {
        const lambda = probabilities?.stats?.goals?.player?.lambda;
        if (lambda === undefined) return null;
        return Math.round(lambda);
    };

    const getDiffColor = (diff) => {
        if (diff > 0) return "text-success";
        if (diff < 0) return "text-danger";
        return "text-secondary";
    };

    // statLabels for the main table and the modal, excluding 'matches' from the list
    const statLabels = [
        { key: "goals", label: "Goals", desc: "The total number of goals scored by a player in a season" },
        { key: "assists", label: "Assists", desc: "Passes that directly lead to a goal being scored in a season" },
        { key: "shots", label: "Shots", desc: "The total number of attempts a player makes to score, including shots on target and those that miss the goal in a season" },
        { key: "shots_on_goal", label: "Shots On Goal", desc: "The number of shots that are on target, meaning they would have resulted in a goal if not saved by the goalkeeper in a season" },
        { key: "big_chances", label: "Big Chances", desc: "Situations where a player is expected to score, typically in one-on-one scenarios or from very close range. This includes penalties in a season" },
        { key: "key_passes", label: "Key Passes", desc: "Passes that lead directly to a shot on goal, indicating a player's ability to create scoring opportunities in a season" },
        { key: "tackles", label: "Tackles", desc: "Defensive actions where a player attempts to take the ball away from an opponent. This can be categorized into tackles won and tackles lost in a season" },
        { key: "pass_completion_pct", label: "Pass %", desc: "The ratio of successful passes to total passes attempted, indicating a player's passing accuracy in a season" },
        { key: "minutes", label: "Minutes", desc: "The total time a player spends on the field during matches, which can be crucial for evaluating their overall contribution in a season" },
        { key: "cautions", label: "Cautions", desc: "Yellow cards received by a player, which can impact their availability for future matches in a season" },
        { key: "ejections", label: "Ejections", desc: "Red cards received by a player, which can impact their availability for future matches in a season" },
        { key: "progressive_carries", label: "Progressive Carries", desc: "Instances where a player carries the ball forward more than five meters, contributing to the team's attacking play in a season" },
        { key: "defensive_actions", label: "Defensive Actions", desc: "Includes tackles, interceptions, and blocks made by a player, reflecting their defensive contributions in a season" },
    ];

    // Stats supported by the Poisson probability endpoint (count-based stats only)
    const probStatLabels = [
        { key: "goals", label: "Goals" },
        { key: "assists", label: "Assists" },
        { key: "shots", label: "Shots" },
        { key: "shots_on_goal", label: "Shots On Goal" },
        { key: "big_chances", label: "Big Chances" },
        { key: "key_passes", label: "Key Passes" },
        { key: "tackles", label: "Tackles" },
        { key: "cautions", label: "Cautions" },
        { key: "ejections", label: "Ejections" },
        { key: "progressive_carries", label: "Progressive Carries" },
        { key: "defensive_actions", label: "Defensive Actions" },
    ];

    const handleEditClick = () => {
        // Ensure we use the raw data for editing
        setEditedData(comparisonData?.rawPlayer || {});
        setEditModalOpen(true);
    };

    const handleSendStatsLink = async () => {
        setSendingLink(true);
        try {
            const token = localStorage.getItem("authToken");

            const res = await fetch(`${BASE_URL}/api/coach/stats/send-stats-link/${playerId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to send link");

            topTost(`Stats link sent to ${data.email}`);
        } catch (err) {
            alert("Failed to send stats link: " + err.message);
        } finally {
            setSendingLink(false);
        }
    };

    const handleInputChange = (key, value) => {
        // Use parseInt for integer fields like matches, or parseFloat for others if needed
        const processedValue = key === 'matches' || key === 'minutes' ? parseInt(value) || 0 : parseFloat(value) || 0;
        
        setEditedData(prev => ({
            ...prev,
            [key]: processedValue
        }));
    };

    // --- Updated handleSaveChanges function ---
    const handleSaveChanges = async () => {
        // 1. Player ID Check 
        if (!playerId) {
            topTostError("Player ID is missing. Cannot save changes.");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            
            // Remove ps_id, player_id, created_at before sending for update
            const { ps_id, player_id, created_at, ...dataToUpdate } = editedData; 

            const response = await fetch(`${BASE_URL}/api/coach/stats/stats/update/${playerId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dataToUpdate),
            });

            if (!response.ok) {
                // Throwing an error for non-200 status codes
                const errorJson = await response.json();
                throw new Error(errorJson.message || "Failed to update statistics");
            }

            // 2. SUCCESS: Show success toast
            topTost("Statistics updated successfully!");

            setEditModalOpen(false);
            // Reload data to show updated averages
            loadComparisonData();

        } catch (error) {
            // 3. ERROR: Show a proper error toast
            // Fallback for simple error objects
            const errorMessage = typeof error.message === 'string' ? error.message : "An unknown error occurred.";
            topTostError("Update failed: " + errorMessage);

        } finally {
            setSaving(false);
        }
    };
    // ------------------------------------------

    const handleCancelEdit = () => {
        // Reset editedData to the original raw data on cancel
        setEditedData(comparisonData?.rawPlayer || {});
        setEditModalOpen(false);
    };

    const handleBack = () => navigate(-1);

    const downloadExcel = async () => {
        if (!comparisonData) return;

        setDownloading(true);
        try {
            const token = localStorage.getItem("authToken");

            // Fetch player name from profile endpoint
            const profileRes = await fetch(`${BASE_URL}/api/coach/players/${playerId}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const profileJson = await profileRes.json();
            const excelFileName = profileJson.player?.p_name || `player-${playerId}`;

            // Load logo as base64
            const logoBase64 = await fetch("/images/football-vector-free-11.png")
                .then(r => r.blob())
                .then(blob => new Promise((res, rej) => {
                    const reader = new FileReader();
                    reader.onloadend = () => res(reader.result.split(",")[1]);
                    reader.onerror = rej;
                    reader.readAsDataURL(blob);
                }));

            const wb = new ExcelJS.Workbook();
            const logoImageId = wb.addImage({ base64: logoBase64, extension: "png" });

            // Helper: add logo + title header to a sheet
            const addLogoAndHeader = (ws, title) => {
                ws.addImage(logoImageId, { tl: { col: 0, row: 0 }, br: { col: 2, row: 3 } });

                ws.mergeCells("D1:H3");
                const titleCell = ws.getCell("D1");
                titleCell.value = title;
                titleCell.font = { bold: true, size: 14, color: { argb: "FF2980B9" } };
                titleCell.alignment = { vertical: "middle", horizontal: "center" };

                ws.mergeCells("A4:H4");
                const siteCell = ws.getCell("A4");
                siteCell.value = "www.sportsassessor.com";
                siteCell.font = { italic: true, size: 9, color: { argb: "FF888888" } };
                siteCell.alignment = { horizontal: "center" };

                ws.addRow([]); // blank spacer before data
            };

            const darkHeader = (row) => {
                row.eachCell(cell => {
                    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a1a2e" } };
                    cell.alignment = { horizontal: "center" };
                });
            };

            // ── Sheet 1: Per-Match Averages ───────────────────────────────────
            const ws1 = wb.addWorksheet("Per-Match Averages");
            ws1.columns = [
                { width: 24 }, { width: 22 }, { width: 24 }, { width: 22 }, { width: 28 },
                { width: 10 }, { width: 10 }, { width: 10 },
            ];
            addLogoAndHeader(ws1, "Player vs Team Comparison");
            darkHeader(ws1.addRow(["Stat", "Actual Player Score", "Player Score Per Match", "Team Score Per Match", "Player Score Contribution (%)"]));

            statLabels.forEach(({ key, label }) => {
                const rawPlayerVal = parseFloat(safeRaw[key] || 0);
                const playerAvg = parseFloat(safePlayer[key] || 0);
                const teamAvg = parseFloat(safeTeam[key] || 0);
                ws1.addRow([label, rawPlayerVal, playerAvg.toFixed(2), teamAvg.toFixed(2), getPercentageDiff(playerAvg, teamAvg) + "%"]);
            });

            // ── Sheet 2: Expected Goals ───────────────────────────────────────
            if (expectedGoals) {
                const ws2 = wb.addWorksheet("Expected Goals");
                ws2.columns = [{ width: 20 }, { width: 20 }, { width: 16 }, { width: 30 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }];
                addLogoAndHeader(ws2, "Expected Goals Analysis");
                darkHeader(ws2.addRow(["Current Goal", "Expected Goal", "Growth Rate(%)"]));
                ws2.addRow([
                    expectedGoals.actualGoals,
                    Math.round(expectedGoals.expectedGoals),
                    expectedGoals.actualGoals
                        ? (((expectedGoals.expectedGoals - expectedGoals.actualGoals) / expectedGoals.actualGoals) * 100).toFixed(1) + "%"
                        : "N/A",
                ]);
            }

            // ── Sheet 3: Match Probability ────────────────────────────────────
            const probDist = probabilities?.stats?.[selectedProbStat];
            if (probDist) {
                const statLabel = probStatLabels.find(s => s.key === selectedProbStat)?.label || selectedProbStat;
                const ws3 = wb.addWorksheet("Match Probability");
                ws3.columns = [{ width: 20 }, { width: 24 }, { width: 22 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }];
                addLogoAndHeader(ws3, `Match Probability — ${statLabel}`);
                darkHeader(ws3.addRow([statLabel, "Player Probability (%)", "Team Probability (%)"]));
                probDist.player.distribution.forEach((row, idx) => {
                    const teamRow = probDist.team.distribution[idx];
                    ws3.addRow([row.k, (row.probability * 100).toFixed(1) + "%", (teamRow.probability * 100).toFixed(1) + "%"]);
                });
            }

            // Download
            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${excelFileName}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Excel export error:", err);
            topTost("Failed to generate Excel file: " + err.message);
        } finally {
            setDownloading(false);
        }
    };

    const safePlayer = comparisonData?.player || {};
    const safeTeam = comparisonData?.team || {};
    const safeRaw = comparisonData?.rawPlayer || {};

    return (
        <>
            <PageHeader>
                <CustomersHeader />
            </PageHeader>

            <div className='main-content'>
                <div className='container py-4'>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button className="btn btn-outline-secondary" onClick={handleBack}>
                            ← Back
                        </button>

                        <h4 className="mb-0">Player vs Team Comparison</h4>

                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success d-flex align-items-center gap-2"
                                onClick={downloadExcel}
                                disabled={loadingComparison || !comparisonData || downloading}
                            >
                                <i className="bi bi-file-earmark-excel"></i>
                                {downloading ? "Preparing..." : "Download Excel"}
                            </button>

                            {/* Assuming only non-ADMIN roles can edit */}
                            {user?.role !== "ADMIN" && (
                                <>
                                    <button
                                        className="btn btn-warning d-flex align-items-center gap-2"
                                        onClick={handleEditClick}
                                        disabled={loadingComparison || !comparisonData}
                                    >
                                        <i className="bi bi-pencil"></i> Edit Stats
                                    </button>

                                    <button
                                        className="btn btn-info text-white d-flex align-items-center gap-2"
                                        onClick={handleSendStatsLink}
                                        disabled={loadingComparison || !comparisonData || sendingLink}
                                        title="Email this player a link to fill in their own stats"
                                    >
                                        {sendingLink ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send"></i> Send Link to Player
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>


                    {loadingComparison ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                            <p className="mt-2">Loading comparison data...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">
                            {error}
                            <button className="btn btn-secondary ms-3" onClick={handleBack}>
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <>
                        <div className="table-responsive">
                            <h5>Per-Match Averages (Matches Played: {safeRaw.matches || 0})</h5>

                            <table className="table table-striped table-hover">
                                <thead className="text-white bg-dark">
                                    <tr>
                                        <th>stat</th>
                                        <th className="text-center">Actual Player Score</th>
                                        <th className="text-center">Player Score Per Match</th>
                                        <th className="text-center">Team Score Per Match</th>
                                        <th className="text-center">Player Score Contribution</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {statLabels.map(({ key, label }) => {
                                        const rawPlayerVal = parseFloat(safeRaw[key] || 0);
                                        const playerAvg = parseFloat(safePlayer[key] || 0);
                                        const teamAvg = parseFloat(safeTeam[key] || 0);

                                        const diff = getPercentageDiff(playerAvg, teamAvg);

                                        return (
                                            <tr key={key}>
                                                <td className="fw-semibold">{label}</td>
                                                {/* Display raw total value */}
                                                <td className="text-center">{rawPlayerVal}</td>
                                                <td className="text-center">{playerAvg.toFixed(2)}</td>
                                                <td className="text-center">{teamAvg.toFixed(2)}</td>
                                                <td className={`text-center fw-bold ${getDiffColor(diff)}`}>
                                                    {diff}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* --- Expected Goals (regression model) --- */}
                        <div className="mt-4">
                            <h5>Expected Goals</h5>
                            {expectedGoalsError ? (
                                <div className="alert alert-warning mb-0">{expectedGoalsError}</div>
                            ) : !expectedGoals ? (
                                <div className="text-muted">Loading expected goals...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered w-auto">
                                        <thead className="text-white bg-dark">
                                            <tr>
                                                <th className="text-center">Current Goal</th>
                                                <th className="text-center">Expected Goal</th>
                                                <th className="text-center">Growth Rate(%)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-center">{expectedGoals.actualGoals}</td>
                                                <td className="text-center">{Math.round(expectedGoals.expectedGoals)}</td>
                                                <td className="text-center">
                                                    {expectedGoals.actualGoals
                                                        ? (((expectedGoals.expectedGoals - expectedGoals.actualGoals) / expectedGoals.actualGoals) * 100).toFixed(1) + "%"
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* --- Goal Probability (Poisson distribution) --- */}
                        <div className="mt-4">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <h5 className="mb-0">Match Probability</h5>
                                <select
                                    className="form-select form-select-sm w-auto"
                                    value={selectedProbStat}
                                    onChange={(e) => setSelectedProbStat(e.target.value)}
                                >
                                    {probStatLabels.map(({ key, label }) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {!probabilities ? (
                                <div className="text-muted">Loading probabilities...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover" style={{ width: "500px" }}>
                                        <thead className="text-white bg-dark">
                                            <tr>
                                                <th className="text-center" style={{ width: "40%" }}>
                                                    {probStatLabels.find(s => s.key === selectedProbStat)?.label}
                                                </th>
                                                <th className="text-center" style={{ width: "30%" }}>Player Probability</th>
                                                <th className="text-center" style={{ width: "30%" }}>Team Probability</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {probabilities.stats?.[selectedProbStat]?.player.distribution.map((row, idx) => {
                                                const teamRow = probabilities.stats[selectedProbStat].team.distribution[idx];
                                                return (
                                                    <tr key={row.k}>
                                                        <td className="text-center fw-semibold">{row.k}</td>
                                                        <td className="text-center">{(row.probability * 100).toFixed(1)}%</td>
                                                        <td className="text-center">{(teamRow.probability * 100).toFixed(1)}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        </>
                    )}
                </div>
            </div>

            <Footer />

            {/* --- Edit Modal --- */}
            {editModalOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: "rgba(0,0,0,0.65)", zIndex: 5000 }}
                >
                    <div
                        className="bg-white p-4 rounded shadow"
                        style={{ width: "90%", maxWidth: 800, maxHeight: "85vh", overflowY: "auto" }}
                    >
                        <div className="d-flex justify-content-between mb-3">
                            <h5>Edit Player Statistics (Raw Totals)</h5>
                            <button className="btn btn-sm btn-danger" onClick={handleCancelEdit} disabled={saving}>
                                Close
                            </button>
                        </div>

                        <table className="table table-striped table-hover">
                            <thead className="bg-dark text-white">
                                <tr>
                                    <th>Stat</th>
                                    <th className="text-center">Actual Value</th>
                                </tr>
                            </thead>

                            <tbody>
                                {/* --- 🎯 Matches Field Added Here (Manual Entry) --- */}
                                <tr>
                                    <td className="fw-bold">
                                        Matches
                                        <div className="text-muted fw-normal" style={{ fontSize: "0.78rem" }}>Total matches played during a season</div>
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm text-center"
                                            value={editedData.matches || 0}
                                            onChange={(e) => {
                                                // Ensures only digits are entered
                                                let val = e.target.value.replace(/[^0-9]/g, ""); 
                                                handleInputChange('matches', val);
                                            }}
                                            min="0"
                                            step="1"
                                            disabled={saving}
                                            style={{ width: "120px", margin: "0 auto" }}
                                        />
                                    </td>
                                </tr>
                                {/* --- Other Stats start here (Mapped) --- */}
                                {statLabels.map(({ key, label, desc }) => (
                                    <tr key={key}>
                                        <td>
                                            <span className="fw-bold">{label}</span>
                                            {desc && <div className="text-muted fw-normal" style={{ fontSize: "0.78rem" }}>{desc}</div>}
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center"
                                                value={editedData[key] || 0}
                                                onChange={(e) => {
                                                    // Allows decimals for stats like Pass %
                                                    let val = e.target.value; 
                                                    handleInputChange(key, val);
                                                }}
                                                min="0"
                                                step="any"
                                                disabled={saving}
                                                style={{ width: "120px", margin: "0 auto" }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <button className="btn btn-secondary" onClick={handleCancelEdit} disabled={saving}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveChanges} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Comparison;