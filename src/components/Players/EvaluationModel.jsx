// import React, { useState, useEffect, useRef } from 'react';
// import { FiDownload, FiX, FiUser, FiCalendar, FiStar, FiClipboard } from 'react-icons/fi';
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const BehaviorTraitModal = ({ playerId, onClose }) => {
//     const [loading, setLoading] = useState(true);
//     const [traitData, setTraitData] = useState(null);
//     const [playerInfo, setPlayerInfo] = useState({});
//     const [combinedData, setCombinedData] = useState(null); // NEW: For admin combined data
//     const modalRef = useRef(null);

//     const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

//     useEffect(() => {
//         loadTraitDataAndPlayerInfo();

//         const handleClickOutside = (event) => {
//             if (modalRef.current && !modalRef.current.contains(event.target)) {
//                 onClose();
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [playerId]);

//     const loadTraitDataAndPlayerInfo = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const user = JSON.parse(localStorage.getItem("user"));
//             const isAdmin = user?.role === "ADMIN";

//             let apiUrl;
//             let dataToSet = null;

//             if (isAdmin) {
//                 // ADMIN: Combined data endpoint
//                 apiUrl = `${BASE_URL}/api/admin/behavior/combined/${playerId}`;
//                 const res = await fetch(apiUrl, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const combinedJson = await res.json();

//                 // Store combined data separately
//                 setCombinedData(combinedJson);

//                 // For backward compatibility, set traitData to first region's data
//                 // Or you can modify getCompetencyData() to handle combined data
//                 if (combinedJson.africa) {
//                     dataToSet = combinedJson.africa;
//                 } else if (combinedJson.asia) {
//                     dataToSet = combinedJson.asia;
//                 }
//                 setTraitData(dataToSet);

//             } else {
//                 // COACH: Normal region-based data
//                 const isAfrica = user?.u_region === "africa";
//                 apiUrl = isAfrica
//                     ? `${BASE_URL}/api/africa/score/${playerId}`
//                     : `${BASE_URL}/api/asia/score/${playerId}`;

//                 const traitRes = await fetch(apiUrl, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const traitJson = await traitRes.json();
//                 setTraitData(traitJson);
//             }

//             // Fetch Player Info
//             const playerRes = await fetch(
//                 `${BASE_URL}/api/coach/evaluation/player/${playerId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const playerJson = await playerRes.json();
//             setPlayerInfo(playerJson.data || {});

//         } catch (err) {
//             console.error("Error loading trait/player info:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // UPDATED: Handle both admin and coach data
//     const getCompetencyData = () => {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const isAdmin = user?.role === "ADMIN";

//         // If admin has combined data
//         if (isAdmin && combinedData) {
//             const allCompetencies = [];

//             // Add Africa data if exists
//             if (combinedData.africa && Array.isArray(combinedData.africa.Competency_Metrics)) {
//                 combinedData.africa.Competency_Metrics.forEach((item, index) => {
//                     allCompetencies.push({
//                         sNo: allCompetencies.length + 1,
//                         competency: item.Competency,
//                         level: item.Level,
//                         score: `${item.Competency_Score_Percent}%`,
//                         gap: `${item.Margin_for_Mastering_Next_Level_Percent}%`,
//                         region: 'Africa'
//                     });
//                 });
//             }

//             // Add Asia data if exists
//             if (combinedData.asia) {
//                 const asiaCompetencies = [
//                     { key: 'game_awareness', name: 'Game Awareness' },
//                     { key: 'team_work', name: 'Team work' },
//                     { key: 'discipline_ethics', name: 'Discipline & Ethics' },
//                     { key: 'resilience', name: 'Resilience' },
//                     { key: 'focus', name: 'Focus' },
//                     { key: 'leadership', name: 'Leadership' },
//                     { key: 'communication', name: 'Communication' },
//                     { key: 'endurance', name: 'Endurance' },
//                     { key: 'speed', name: 'Speed' }
//                 ];

//                 asiaCompetencies.forEach((comp, index) => {
//                     if (combinedData.asia[comp.key]) {
//                         allCompetencies.push({
//                             sNo: allCompetencies.length + 1,
//                             competency: comp.name,
//                             level: combinedData.asia[comp.key]?.level || 'N/A',
//                             score: combinedData.asia[comp.key]?.competency_score || 'N/A',
//                             gap: combinedData.asia[comp.key]?.margin_for_mastering_next_level || 'N/A',
//                             region: 'Asia'
//                         });
//                     }
//                 });
//             }

//             return allCompetencies;
//         }

//         // For non-admin (coach)
//         if (!traitData) return [];

//         const userNormal = JSON.parse(localStorage.getItem("user"));
//         const isAfrica = userNormal && userNormal.u_region === "africa";

//         if (isAfrica) {
//             return traitData.Competency_Metrics.map((item, index) => ({
//                 sNo: index + 1,
//                 competency: item.Competency,
//                 level: item.Level,
//                 score: `${item.Competency_Score_Percent}%`,
//                 gap: `${item.Margin_for_Mastering_Next_Level_Percent}%`,
//                 region: 'Africa'
//             }));
//         } else {
//             const competencies = [
//                 { key: 'game_awareness', name: 'Game Awareness' },
//                 { key: 'team_work', name: 'Team work' },
//                 { key: 'discipline_ethics', name: 'Discipline & Ethics' },
//                 { key: 'resilience', name: 'Resilience' },
//                 { key: 'focus', name: 'Focus' },
//                 { key: 'leadership', name: 'Leadership' },
//                 { key: 'communication', name: 'Communication' },
//                 { key: 'endurance', name: 'Endurance' },
//                 { key: 'speed', name: 'Speed' }
//             ];

//             return competencies.map((comp, index) => ({
//                 sNo: index + 1,
//                 competency: comp.name,
//                 level: traitData[comp.key]?.level || 'N/A',
//                 score: traitData[comp.key]?.competency_score || 'N/A',
//                 gap: traitData[comp.key]?.margin_for_mastering_next_level || 'N/A',
//                 region: 'Asia'
//             }));
//         }
//     };

//     // UPDATED: Get overall scores for admin
//     const getOverallScore = () => {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const isAdmin = user?.role === "ADMIN";

//         if (isAdmin && combinedData) {
//             let scores = [];

//             if (combinedData.africa && combinedData.africa.Player_Behavior_Overall_Score) {
//                 scores.push(`Africa: ${combinedData.africa.Player_Behavior_Overall_Score}%`);
//             }

//             if (combinedData.asia && combinedData.asia.player_behavior_trait_overall_score) {
//                 scores.push(`Asia: ${combinedData.asia.player_behavior_trait_overall_score}%`);
//             }

//             return scores.length > 0 ? scores.join(' | ') : 'N/A';
//         }

//         // For non-admin
//         if (!traitData) return 'N/A';
//         const userNormal = JSON.parse(localStorage.getItem("user"));
//         const isAfrica = userNormal && userNormal.u_region === "africa";
//         return isAfrica ? `${traitData.Player_Behavior_Overall_Score}%` : traitData.player_behavior_trait_overall_score;
//     };

//     // UPDATED: Get definitions for both regions
//     const getDefinitions = () => {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const isAdmin = user?.role === "ADMIN";

//         const asiaDefinitions = {
//             "Game Awareness": "It is defined as a players skill to understand the sport and virtually place themselves in the field to formulate plans",
//             "Team work": "Team success depends on teamwork and bonds in the team.Team work can be defined as various skills developed through experiences in the field.",
//             "Discipline & Ethics": "Discipline and ethics fosters an environment of integrity & respect within the sport. These values do not only improve the individual performance but improve the ideology of the sport.",
//             "Resilience": "This trait refers to bouncing back from setbacks, perform under stress & adapt to defiant situations",
//             "Focus": "This skill is to concentrate and not be distracted by internal and external factors.",
//             "Leadership": "It includes a range of skills & abilities that enable players to motivate, coach & inspire others in a team effectively.",
//             "Communication": "Effective communication plays a crucial role in soccer i.e. on field performance & team dynamics",
//             "Endurance": "This is a test of fitness for players who are expected to have stamina that would last for a 90 min match.",
//             "Speed": "This trait is a crucial quality in football that impacts performance on the field.Players with high speeds break the opponents defence and build scoring opportunities."
//         };

//         const africaDefinitions = {
//             ...asiaDefinitions,
//             "Agility": "The skill to maintain high speed with control and balance"
//         };

//         if (isAdmin) {
//             // Return both regions' definitions for admin
//             const allDefinitions = {};

//             // Add Africa definitions
//             Object.entries(africaDefinitions).forEach(([key, value]) => {
//                 allDefinitions[`[Africa] ${key}`] = value;
//             });

//             // Add Asia definitions
//             Object.entries(asiaDefinitions).forEach(([key, value]) => {
//                 allDefinitions[`[Asia] ${key}`] = value;
//             });

//             return allDefinitions;
//         } else {
//             // For coach, return based on region
//             const isAfrica = user?.u_region === "africa";
//             return isAfrica ? africaDefinitions : asiaDefinitions;
//         }
//     };

//     // UPDATED: Generate PDF for admin
//     const generatePDF = () => {
//         try {
//             const user = JSON.parse(localStorage.getItem("user"));
//             const isAdmin = user?.role === "ADMIN";

//             if (isAdmin && !combinedData) {
//                 alert("Combined data nahi mila PDF ke liye!");
//                 return;
//             }

//             if (!isAdmin && !traitData) {
//                 alert("Trait data nahi mila PDF ke liye!");
//                 return;
//             }

//             const doc = new jsPDF('p', 'mm', 'a4');
//             const pageWidth = doc.internal.pageSize.getWidth();
//             const pageHeight = doc.internal.pageSize.getHeight();
//             let y = 20;

//             // Header
//             doc.setFontSize(20);
//             doc.setTextColor(40, 53, 147);
//             doc.text("Football Player Behavior Trait Map", pageWidth / 2, y, { align: "center" });
//             y += 15;

//             // Player Info
//             const playerName = playerInfo?.player_name || "Unknown Player";
//             const overallScore = getOverallScore();

//             doc.setFontSize(14);
//             doc.setTextColor(0, 0, 0);
//             doc.text(`Name: ${playerName}`, 20, y); y += 7;
//             doc.text(`Overall Scores: ${overallScore}`, 20, y); y += 10;

//             // Table Data
//             const tableData = getCompetencyData().map(item => [
//                 item.sNo,
//                 item.competency,
//                 item.region || (user?.u_region === "africa" ? "Africa" : "Asia"),
//                 item.level,
//                 item.score,
//                 item.gap
//             ]);

//             // Generate Table
//             autoTable(doc, {
//                 startY: y,
//                 head: [["S.No", "Competency", "Region", "Competency Level", "Competency Score", "Gap for Mastering the next level"]],
//                 body: tableData,
//                 theme: "grid",
//                 headStyles: { fillColor: [39, 174, 96] },
//                 columnStyles: {
//                     0: { cellWidth: 12, halign: "center" },
//                     1: { cellWidth: 40 },
//                     2: { cellWidth: 25, halign: "center" },
//                     3: { cellWidth: 30, halign: "center" },
//                     4: { cellWidth: 30, halign: "center" },
//                     5: { cellWidth: 35, halign: "center" }
//                 },
//                 didDrawPage: (data) => {
//                     // Optional: Add page numbers if needed
//                 }
//             });

//             y = doc.lastAutoTable.finalY + 10;

//             // Competency Definitions
//             doc.setFontSize(16);
//             doc.text("Competency Definitions", 20, y); y += 10;
//             const definitions = getDefinitions();
//             doc.setFontSize(12);
//             const maxWidth = pageWidth - 40;
//             Object.entries(definitions).forEach(([comp, def]) => {
//                 const fullText = `${comp}: ${def}`;
//                 const lines = doc.splitTextToSize(fullText, maxWidth);
//                 lines.forEach(line => {
//                     if (y + 10 > pageHeight - 20) {
//                         doc.addPage();
//                         y = 20;
//                     }
//                     doc.text(line, 20, y);
//                     y += 6;
//                 });
//                 y += 4;
//             });

//             const fileName = `BehaviorTrait_${playerName}_${isAdmin ? 'Admin' : user?.u_region || 'coach'}.pdf`;
//             doc.save(fileName);
//             console.log("PDF successfully download!");

//         } catch (error) {
//             console.error("PDF Generation Error:", error);
//             alert("PDF generate nahi ho payi. Error: " + error.message);
//         }
//     };

//     // Rest of the component remains similar, but update table headers
//     const competencyData = getCompetencyData();
//     const definitions = getDefinitions();
//     const user = JSON.parse(localStorage.getItem("user"));
//     const isAdmin = user?.role === "ADMIN";

//     return (
//         <div className="modal-backdrop" style={{
//             position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
//             backgroundColor: 'rgba(0, 0, 0, 0.4)',
//             display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050
//         }}>
//             <div className="modal-content bg-white rounded shadow-lg" ref={modalRef} style={{
//                 maxWidth: '1300px', // Increased width for admin
//                 width: '98%',
//                 pointerEvents: 'auto',
//                 backgroundColor: '#fff',
//             }}>

//                 <div className="modal-header bg-light p-3 border-bottom">
//                     <h5 className="modal-title text-dark">
//                         <FiClipboard className="me-2 text-primary" />
//                         Football Player Behavior Trait Map
//                         {isAdmin && <span className="badge bg-danger ms-2">Admin View</span>}
//                     </h5>
//                 </div>

//                 <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

//                     <div className="card mb-4 shadow-sm border-0">
//                         <div className="card-body bg-light rounded">
//                             <div className="row align-items-center">
//                                 <div className="col-md-4">
//                                     <p className="mb-1 text-primary"><FiUser className="me-2" /> Name:</p>
//                                     <h6 className="fw-bold text-dark">{playerInfo.player_name}</h6>
//                                 </div>
//                                 <div className="col-md-4">
//                                     <p className="mb-1 text-primary"><FiStar className="me-2" /> Overall Scores:</p>
//                                     <h6 className="fw-bold text-dark">{getOverallScore()}</h6>
//                                 </div>
//                                 <div className="col-md-4 text-end">
//                                     <button className="btn btn-primary" onClick={generatePDF}>
//                                         <FiDownload className="me-2" /> Download Report
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <h5 className="mb-3 text-secondary border-bottom pb-2">
//                         Competency Details {isAdmin && <small className="text-muted">(All Regions)</small>}
//                     </h5>
//                     <div className="table-responsive">
//                         <table className="table table-bordered table-hover align-middle">
//                             <thead className="bg-primary text-white">
//                                 <tr>
//                                     <th style={{ width: '5%', textAlign: 'center' }}>S.No</th>
//                                     <th style={{ width: isAdmin ? '25%' : '30%' }}>Competency</th>
//                                     {isAdmin && <th style={{ width: '10%', textAlign: 'center' }}>Region</th>}
//                                     <th style={{ width: isAdmin ? '15%' : '20%', textAlign: 'center' }}>Level</th>
//                                     <th style={{ width: isAdmin ? '15%' : '20%', textAlign: 'center' }}>Score</th>
//                                     <th style={{ width: isAdmin ? '20%' : '25%', textAlign: 'center' }}>Gap for Next Level</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {competencyData.map((item) => (
//                                     <tr key={`${item.region || ''}-${item.sNo}`}>
//                                         <td className="fw-bold text-center">{item.sNo}</td>
//                                         <td>{item.competency}</td>
//                                         {isAdmin && (
//                                             <td style={{ textAlign: 'center' }}>
//                                                 <span className={`badge ${item.region === 'Africa' ? 'bg-success' : 'bg-warning'}`}>
//                                                     {item.region}
//                                                 </span>
//                                             </td>
//                                         )}
//                                         <td style={{ textAlign: 'center' }}>{item.level}</td>
//                                         <td style={{ textAlign: 'center' }}>{item.score}</td>
//                                         <td style={{ textAlign: 'center' }}>{item.gap}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     <h5 className="mb-3 text-secondary border-bottom pb-2 mt-4">
//                         Competency Definitions {isAdmin && <small className="text-muted">(All Regions)</small>}
//                     </h5>
//                     <div>
//                         {Object.entries(definitions).map(([comp, def]) => (
//                             <div key={comp} className="mb-3">
//                                 <strong>{comp}:</strong> {def}
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="modal-footer p-3 border-top">
//                     <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
//                         <FiX className="me-2" /> Close
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default BehaviorTraitModal;

import React, { useState, useEffect, useRef } from 'react';
import { FiDownload, FiX, FiUser, FiStar, FiClipboard } from 'react-icons/fi';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BehaviorTraitModal = ({ playerId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [traitData, setTraitData] = useState(null);
    const [playerInfo, setPlayerInfo] = useState({});
    const [combinedData, setCombinedData] = useState(null);
    const modalRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role === "ADMIN";
    const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

    useEffect(() => {
        loadTraitDataAndPlayerInfo();

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [playerId, onClose]);

    const loadTraitDataAndPlayerInfo = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const user = JSON.parse(localStorage.getItem("user"));
            const isAdmin = user?.role === "ADMIN";

            let apiUrl;
            let dataToSet = null;

            if (isAdmin) {
                apiUrl = `${BASE_URL}/api/admin/behavior/combined/${playerId}`;
                const res = await fetch(apiUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const combinedJson = await res.json();
                setCombinedData(combinedJson);

                if (combinedJson.africa) {
                    dataToSet = combinedJson.africa;
                } else if (combinedJson.asia) {
                    dataToSet = combinedJson.asia;
                }
                setTraitData(dataToSet);
            } else {
                const isAfrica = user?.u_region === "africa";
                apiUrl = isAfrica
                    ? `${BASE_URL}/api/africa/score/${playerId}`
                    : `${BASE_URL}/api/asia/score/${playerId}`;

                const traitRes = await fetch(apiUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const traitJson = await traitRes.json();
                setTraitData(traitJson);
            }

            const playerRes = await fetch(
                `${BASE_URL}/api/coach/evaluation/player/${playerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const playerJson = await playerRes.json();
            setPlayerInfo(playerJson.data || {});

        } catch (err) {
            console.error("Error loading trait/player info:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCompetencyData = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const isAdmin = user?.role === "ADMIN";

        if (isAdmin && combinedData) {
            const allCompetencies = [];

            if (combinedData.africa && Array.isArray(combinedData.africa.Competency_Metrics)) {
                combinedData.africa.Competency_Metrics.forEach((item) => {
                    allCompetencies.push({
                        sNo: allCompetencies.length + 1,
                        competency: item.Competency,
                        level: item.Level,
                        score: `${item.Competency_Score_Percent}%`,
                        gap: `${item.Margin_for_Mastering_Next_Level_Percent}%`,
                        region: 'Africa'
                    });
                });
            }

            if (combinedData.asia) {
                const asiaKeys = [
                    'game_awareness', 'team_work', 'discipline_ethics', 'resilience', 'focus',
                    'leadership', 'communication', 'endurance', 'speed'
                ];
                const asiaNames = {
                    'game_awareness': 'Game Awareness', 'team_work': 'Team Work', 'discipline_ethics': 'Discipline & Ethics',
                    'resilience': 'Resilience', 'focus': 'Focus', 'leadership': 'Leadership',
                    'communication': 'Communication', 'endurance': 'Endurance', 'speed': 'Speed'
                };

                asiaKeys.forEach((key) => {
                    if (combinedData.asia[key]) {
                        allCompetencies.push({
                            sNo: allCompetencies.length + 1,
                            competency: asiaNames[key],
                            level: combinedData.asia[key]?.level || 'N/A',
                            score: combinedData.asia[key]?.competency_score || 'N/A',
                            gap: combinedData.asia[key]?.margin_for_mastering_next_level || 'N/A',
                            region: 'Asia'
                        });
                    }
                });
            }

            return allCompetencies;
        }

        if (!traitData) return [];

        const isAfrica = user?.u_region === "africa";

        if (isAfrica) {
            return traitData.Competency_Metrics.map((item, index) => ({
                sNo: index + 1,
                competency: item.Competency,
                level: item.Level,
                score: `${item.Competency_Score_Percent}%`,
                gap: `${item.Margin_for_Mastering_Next_Level_Percent}%`,
                region: 'Africa'
            }));
        } else {
            const asiaCompetencies = [
                { key: 'game_awareness', name: 'Game Awareness' }, { key: 'team_work', name: 'Team Work' },
                { key: 'discipline_ethics', name: 'Discipline & Ethics' }, { key: 'resilience', name: 'Resilience' },
                { key: 'focus', name: 'Focus' }, { key: 'leadership', name: 'Leadership' },
                { key: 'communication', name: 'Communication' }, { key: 'endurance', name: 'Endurance' },
                { key: 'speed', name: 'Speed' }
            ];

            return asiaCompetencies.map((comp, index) => ({
                sNo: index + 1,
                competency: comp.name,
                level: traitData[comp.key]?.level || 'N/A',
                score: traitData[comp.key]?.competency_score || 'N/A',
                gap: traitData[comp.key]?.margin_for_mastering_next_level || 'N/A',
                region: 'Asia'
            }));
        }
    };

    const getOverallScore = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const isAdmin = user?.role === "ADMIN";

        if (isAdmin && combinedData) {
            let scores = [];

            if (combinedData.africa && combinedData.africa.Player_Behavior_Overall_Score) {
                scores.push(`Africa: ${combinedData.africa.Player_Behavior_Overall_Score}%`);
            }

            if (combinedData.asia && combinedData.asia.player_behavior_trait_overall_score) {
                scores.push(`Asia: ${combinedData.asia.player_behavior_trait_overall_score}%`);
            }

            return scores.length > 0 ? scores.join(' | ') : 'N/A';
        }

        if (!traitData) return 'N/A';
        const userNormal = JSON.parse(localStorage.getItem("user"));
        const isAfrica = userNormal && userNormal.u_region === "africa";
        return isAfrica ? `${traitData.Player_Behavior_Overall_Score}%` : traitData.player_behavior_trait_overall_score;
    };

    // const getDefinitions = () => {
    //     const user = JSON.parse(localStorage.getItem("user"));
    //     const isAfrica = user?.u_region === "africa";
    //     const isAdmin = user?.role === "ADMIN";

    //     const DEFINITIONS_DATA = {
    //         'Game Awareness': 'It is defined as a players skill to understand the sport and virtually place themselves in the field to formulate plans',
    //         'Team Work': 'Team success depends on teamwork and bonds in the team.Team work can be defined as various skills developed through experiences in the field.',
    //         'Discipline & Ethics': 'Discipline and ethics fosters an environment of integrity & respect within the sport. These values do not only improve the individual performance but improve the ideology of the sport.',
    //         'Resilience': 'This trait refers to bouncing back from setbacks, perform under stress & adapt to defiant situations',
    //         'Focus': 'This skill is to concentrate and not be distracted by internal and external factors.',
    //         'Leadership': 'It includes a range of skills & abilities that enable players to motivate, coach & inspire others in a team effectively.',
    //         'Communication': 'Effective communication plays a crucial role in soccer i.e. on field performance & team dynamics',
    //         'Endurance': 'This is a test of fitness for players who are expected to have stamina that would last for a 90 min match.',
    //         'Speed': 'This trait is a crucial quality in football that impacts performance on the field.Players with high speeds break the opponents defence and build scoring opportunities. The ability to gain momentum and maintain high speed is important for a defensive or offensive play.',
    //         'Agility': 'The skill to maintain high speed with control and balance'
    //     };

    //     let competenciesToShow = Object.keys(DEFINITIONS_DATA);

    //     if (!isAdmin && !isAfrica) {
    //         competenciesToShow = competenciesToShow.filter(comp => comp !== 'Agility');
    //     }

    //     return {
    //         competencies: competenciesToShow,
    //         definitionsData: DEFINITIONS_DATA
    //     };
    // };

    // const getCompetencyLevels = () => {
    //     const user = JSON.parse(localStorage.getItem("user"));
    //     const isAfrica = user?.u_region === "africa";
    //     const isAdmin = user?.role === "ADMIN";

    //     const LEVELS_DATA = {
    //         'Game Awareness': {
    //             'Level 1': 'At this stage players are exposed to different levels of game awareness. Players gain know how to inspect their ambience & understand oscillation in the game dynamics.',
    //             'Level 2': 'Players begin to develop comprehensive thoughts of well planned positioning I.e. where to be during offensive and defensive phases of the game and decision making i.e. gauge situations and adopt the most effective action in the favor of the team.',
    //             'Level 3': 'During this stage players demonstrates high levels of awareness. Players can read the game productively , forsee opponents actions & take swift actions that influence the outcome of the game.',
    //             'Level 4': 'Players at this stage master game awareness seen in professional or elite amateur players.They can analyze complicated game synopsis’s & execute high level plans with precision.'
    //         },
    //         'Team Work': {
    //             'Level 1': 'Communication is important to foster team work. Communication includes verbal and non verbal cues. Verbal cues include shouting commands in the field and non verbal cues include body language. Communication builds trust and transparency in a team.',
    //             'Level 2': 'At this stage players understand their role in a team. Players are aware of the strengths and weaknesses of their team mates. Focus is on team performance not individual performance. Football requires swift decisions to be made under pressure.Players assess situations swiftly and make critical choices that benefit the team',
    //             'Level 3': 'Football involves acts of collusion where team members work hand in hand to achieve common goals.This includes team players promoting each other during practice sessions and matches. Encourage one another to improve. Building a base for good habbits collectively. The skill to collude would results in better performance and outcomes on the field.',
    //             'Level 4': 'Trust & Respect are crucial for team spirit. Team members must be confident in each others skills and judgement that fosters a rich team atmosphere. Trust allows transparency and willingness to take risks.'
    //         },
    //         'Discipline & Ethics': {
    //             'Level 1': 'At this stage players are aware of fair play where players uphold integrity & respect their opponents. Players are exposed to discipline & ethics in a supportive environment.',
    //             'Level 2': 'Players adhere to rules and understand ethical predicament. They take responsibility for their actions and understand the impact on the team performance',
    //             'Level 3': 'Players not only follow rules but actively promote righteous behavior amongst peers.Players take righteous decisions under pressure & serve as role models for younger players.Players exhibit strong work morals.',
    //             'Level 4': 'At this stage players look at ethical implications of their actions & guide others.They play an active role in promoting the culture of integrity within their teams or the broader football community.'
    //         },
    //         'Resilience': {
    //             'Level 1': 'This stage involves remaining calm and composed during stressful situations to make sound decisions.Players manage emotional outbursts specially during high pressure moments such as penalty shoot outs or during critical matches.',
    //             'Level 2': 'Supporting team mates when mistakes occur. The support is in the form of verbal encouragement to help others to recover from setup backs that results in positive team spirit.',
    //             'Level 3': 'Players adapt their plans and strategies to dynamic circumstances. This includes determination to overcome challenges & a proactive learning from experiences.',
    //             'Level 4': 'In this stage players look at losses as opportunities to succeed and grow rather than fail.Analysis of the errs help to improve future performance.'
    //         },
    //         'Focus': {
    //             'Level 1': 'Concentrate on immediate game related tasks such as positioning, ball control & anticipating opponents steps.This is further embellished by asking questions during play such as where is the ball and what should I do next.',
    //             'Level 2': 'Concentrate on immediate game related tasks such as positioning, ball control & anticipating opponents steps.This is further embellished by asking questions during play such as where is the ball and what should I do next.',
    //             'Level 3': 'Practice concentration exercises to clear the mind from distractions, have full control during games & practice sessions. Techniques include visualizations, positive self talk & breathing exercises to manage anxiety.',
    //             'Level 4': 'Incorporating pre game and in game routines can help maintain focus.These routines include mental checklists or physical warmups before the game.'
    //         },
    //         'Leadership': {
    //             'Level 1': 'Players have less experience & perform simple tasks related to leadership.Require supervision and guidance for executing responsibilities. In football it includes team dynamics & coaching strategies without the ability to implement them independently.',
    //             'Level 2': 'Players can perform some tasks with independence. In the context of foot ball players are well versed with leadership skills i.e. team dynamics & motivating players but need support in complex situations.',
    //             'Level 3': 'Proficient leaders demonstrate a strong understanding of leadership principles and can manage team dynamics.They can make decisions that enhance the performance of the team & decisions that align with team goals.',
    //             'Level 4': 'Players have the high levels of mastery in leadership skills.Apart from leading they mentor others,contribute to strategic planning & drive organizational change within the football space.Decisions are formed with experience and deeper understanding of the game.'
    //         },
    //         'Communication': {
    //             'Level 1': 'As this stage players are learning fundamental skills in communication.Players may struggle with precision and pliability in their verbal and non verbal communication cues',
    //             'Level 2': 'As this stage players are learning fundamental skills in communication.Players may struggle with precision and pliability in their verbal and non verbal communication cues',
    //             'Level 3': 'Players demonstrate better understanding of communication dynamics.They can convey messages & respond to team mates but there is room for clarity and improvement',
    //             'Level 4': 'Players exhibit high levels of communication competency.Players can forsee their needs , provide timely feedback & accommodate different communication styles.At this stage there is more indepth understanding of communication cues.'
    //         },
    //         'Endurance': {
    //             'Level 1': 'In this stage players fitness are tested with moderate intensity over extended periods.This is the base level of fitness that can be recovered during low intensity periods.',
    //             'Level 2': 'In this stage players fitness are tested with moderate intensity over extended periods.This is the base level of fitness that can be recovered during low intensity periods',
    //             'Level 3': 'In this stage players exhibit short bursts of energy over short periods i.e. sprints & tackles. This permits high amounts of efforts over short periods',
    //             'Level 4': 'This stage marks high speeds over long periods that is crucial during critical moments of a match'
    //         },
    //         'Speed': {
    //             'Level 1': 'The ability to sprint in a straight line and break away from defenders',
    //             'Level 2': 'The ability to sprint in a straight line and break away from defenders',
    //             'Level 3': 'This stage includes players who can sprint and change direction in different games',
    //             'Level 4': 'Players can maneuver on the field and can touch high levels of speed and slow down whenever it is required'
    //         },
    //         'Agility': {
    //             'Level 1': 'This stage involves sprinting 15 meters and taking a 180 degree turn and running back 10 meters. This stage differentiates different players of different competitive levels.',
    //             'Level 2': 'This stage involves sprinting 15 meters and taking a 180 degree turn and running back 10 meters. This stage differentiates different players of different competitive levels',
    //             'Level 3': 'This stages involves the amount of time taken to go through a cone setup & tests different directional changes.',
    //             'Level 4': 'At this stage a player is tested with many directional changes at high speed.'
    //         }
    //     };

    //     let competenciesToShow = Object.keys(LEVELS_DATA);

    //     if (!isAdmin && !isAfrica) {
    //         competenciesToShow = competenciesToShow.filter(comp => comp !== 'Agility');
    //     }

    //     return {
    //         competencies: competenciesToShow,
    //         levelsData: LEVELS_DATA
    //     };
    // };

    // اصلاح شدہ getDefinitions() فنکشن
    const getDefinitions = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const isAfrica = user?.u_region === "africa";
        const isAdmin = user?.role === "ADMIN";

        const DEFINITIONS_DATA = {
            'Game Awareness': 'It is defined as a player\'s skill to understand the sport and virtually place themselves in the field to formulate plans.',
            'Team Work': 'Team success depends on teamwork and bonds in the team. Team work can be defined as various skills developed through experiences in the field.',
            'Discipline & Ethics': 'Discipline and ethics fosters an environment of integrity & respect within the sport. These values do not only improve the individual performance but improve the ideology of the sport.',
            'Resilience': 'This trait refers to bouncing back from setbacks, perform under stress & adapt to difficult situations.',
            'Focus': 'This skill is to concentrate and not be distracted by internal and external factors.',
            'Leadership': 'It includes a range of skills & abilities that enable players to motivate, coach & inspire others in a team effectively.',
            'Communication': 'Effective communication plays a crucial role in soccer i.e., on-field performance & team dynamics.',
            'Endurance': 'This is a test of fitness for players who are expected to have stamina that would last for a 90-minute match.',
            'Speed': 'This trait is a crucial quality in football that impacts performance on the field. Players with high speeds break the opponent\'s defence and build scoring opportunities. The ability to gain momentum and maintain high speed is important for defensive or offensive play.',
            'Agility': 'The skill to maintain high speed with control and balance.'
        };

        let competenciesToShow = Object.keys(DEFINITIONS_DATA);

        if (!isAdmin && !isAfrica) {
            competenciesToShow = competenciesToShow.filter(comp => comp !== 'Agility');
        }

        return {
            competencies: competenciesToShow,
            definitionsData: DEFINITIONS_DATA
        };
    };

    // اصلاح شدہ getCompetencyLevels() فنکشن
    const getCompetencyLevels = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const isAfrica = user?.u_region === "africa";
        const isAdmin = user?.role === "ADMIN";

        const LEVELS_DATA = {
            'Game Awareness': {
                'Level 1': 'At this stage, players are exposed to different levels of game awareness. Players gain know-how to inspect their ambience & understand oscillation in the game dynamics.',
                'Level 2': 'Players begin to develop comprehensive thoughts of well-planned positioning i.e., where to be during offensive and defensive phases of the game and decision making i.e., gauge situations and adopt the most effective action in the favor of the team.',
                'Level 3': 'During this stage, players demonstrate high levels of awareness. Players can read the game productively, foresee opponents\' actions & take swift actions that influence the outcome of the game.',
                'Level 4': 'Players at this stage master game awareness seen in professional or elite amateur players. They can analyze complicated game synopses & execute high-level plans with precision.'
            },
            'Team Work': {
                'Level 1': 'Communication is important to foster teamwork. Communication includes verbal and non-verbal cues. Verbal cues include shouting commands in the field and non-verbal cues include body language. Communication builds trust and transparency in a team.',
                'Level 2': 'At this stage, players understand their role in a team. Players are aware of the strengths and weaknesses of their teammates. Focus is on team performance, not individual performance. Football requires swift decisions to be made under pressure. Players assess situations swiftly and make critical choices that benefit the team.',
                'Level 3': 'Football involves acts of collusion where team members work hand in hand to achieve common goals. This includes team players promoting each other during practice sessions and matches. Encourage one another to improve. Building a base for good habits collectively. The skill to collude would result in better performance and outcomes on the field.',
                'Level 4': 'Trust & Respect are crucial for team spirit. Team members must be confident in each other\'s skills and judgement that fosters a rich team atmosphere. Trust allows transparency and willingness to take risks.'
            },
            'Discipline & Ethics': {
                'Level 1': 'At this stage, players are aware of fair play where players uphold integrity & respect their opponents. Players are exposed to discipline & ethics in a supportive environment.',
                'Level 2': 'Players adhere to rules and understand ethical predicaments. They take responsibility for their actions and understand the impact on the team performance.',
                'Level 3': 'Players not only follow rules but actively promote righteous behavior amongst peers. Players take righteous decisions under pressure & serve as role models for younger players. Players exhibit strong work ethics.',
                'Level 4': 'At this stage, players look at ethical implications of their actions & guide others. They play an active role in promoting the culture of integrity within their teams or the broader football community.'
            },
            'Resilience': {
                'Level 1': 'This stage involves remaining calm and composed during stressful situations to make sound decisions. Players manage emotional outbursts, especially during high-pressure moments such as penalty shoot-outs or during critical matches.',
                'Level 2': 'Supporting teammates when mistakes occur. The support is in the form of verbal encouragement to help others recover from setbacks that result in positive team spirit.',
                'Level 3': 'Players adapt their plans and strategies to dynamic circumstances. This includes determination to overcome challenges & proactive learning from experiences.',
                'Level 4': 'In this stage, players look at losses as opportunities to succeed and grow rather than fail. Analysis of errors helps to improve future performance.'
            },
            'Focus': {
                'Level 1': 'Concentrate on immediate game-related tasks such as positioning, ball control & anticipating opponents\' steps. This is further embellished by asking questions during play such as where is the ball and what should I do next.',
                'Level 2': 'Concentrate on immediate game-related tasks such as positioning, ball control & anticipating opponents\' steps. This is further embellished by asking questions during play such as where is the ball and what should I do next.',
                'Level 3': 'Practice concentration exercises to clear the mind from distractions, have full control during games & practice sessions. Techniques include visualizations, positive self-talk & breathing exercises to manage anxiety.',
                'Level 4': 'Incorporating pre-game and in-game routines can help maintain focus. These routines include mental checklists or physical warmups before the game.'
            },
            'Leadership': {
                'Level 1': 'Players have less experience & perform simple tasks related to leadership. Require supervision and guidance for executing responsibilities. In football, it includes team dynamics & coaching strategies without the ability to implement them independently.',
                'Level 2': 'Players can perform some tasks with independence. In the context of football, players are well-versed with leadership skills i.e., team dynamics & motivating players but need support in complex situations.',
                'Level 3': 'Proficient leaders demonstrate a strong understanding of leadership principles and can manage team dynamics. They can make decisions that enhance the performance of the team & decisions that align with team goals.',
                'Level 4': 'Players have high levels of mastery in leadership skills. Apart from leading, they mentor others, contribute to strategic planning & drive organizational change within the football space. Decisions are formed with experience and deeper understanding of the game.'
            },
            'Communication': {
                'Level 1': 'At this stage, players are learning fundamental skills in communication. Players may struggle with precision and clarity in their verbal and non-verbal communication cues.',
                'Level 2': 'At this stage, players are learning fundamental skills in communication. Players may struggle with precision and clarity in their verbal and non-verbal communication cues.',
                'Level 3': 'Players demonstrate better understanding of communication dynamics. They can convey messages & respond to teammates but there is room for clarity and improvement.',
                'Level 4': 'Players exhibit high levels of communication competency. Players can foresee their needs, provide timely feedback & accommodate different communication styles. At this stage, there is more in-depth understanding of communication cues.'
            },
            'Endurance': {
                'Level 1': 'In this stage, players\' fitness is tested with moderate intensity over extended periods. This is the base level of fitness that can be recovered during low-intensity periods.',
                'Level 2': 'In this stage, players\' fitness is tested with moderate intensity over extended periods. This is the base level of fitness that can be recovered during low-intensity periods.',
                'Level 3': 'In this stage, players exhibit short bursts of energy over short periods i.e., sprints & tackles. This permits high amounts of efforts over short periods.',
                'Level 4': 'This stage marks high speeds over long periods that is crucial during critical moments of a match.'
            },
            'Speed': {
                'Level 1': 'The ability to sprint in a straight line and break away from defenders.',
                'Level 2': 'The ability to sprint in a straight line and break away from defenders.',
                'Level 3': 'This stage includes players who can sprint and change direction in different games.',
                'Level 4': 'Players can maneuver on the field and can touch high levels of speed and slow down whenever it is required.'
            },
            'Agility': {
                'Level 1': 'This stage involves sprinting 15 meters and taking a 180-degree turn and running back 10 meters. This stage differentiates players of different competitive levels.',
                'Level 2': 'This stage involves sprinting 15 meters and taking a 180-degree turn and running back 10 meters. This stage differentiates players of different competitive levels.',
                'Level 3': 'This stage involves the amount of time taken to go through a cone setup & tests different directional changes.',
                'Level 4': 'At this stage, a player is tested with many directional changes at high speed.'
            }
        };

        let competenciesToShow = Object.keys(LEVELS_DATA);

        if (!isAdmin && !isAfrica) {
            competenciesToShow = competenciesToShow.filter(comp => comp !== 'Agility');
        }

        return {
            competencies: competenciesToShow,
            levelsData: LEVELS_DATA
        };
    };

    // const generatePDF = () => {
    //     try {
    //         const user = JSON.parse(localStorage.getItem("user"));
    //         const isAdmin = user?.role === "ADMIN";

    //         if ((isAdmin && !combinedData) || (!isAdmin && !traitData)) {
    //             alert("Data not available for PDF generation!");
    //             return;
    //         }

    //         const doc = new jsPDF('p', 'mm', 'a4');
    //         const pageWidth = doc.internal.pageSize.getWidth();
    //         const pageHeight = doc.internal.pageSize.getHeight();

    //         // PDF Styling
    //         const primaryColor = [39, 174, 96]; // Green
    //         const secondaryColor = [41, 128, 185]; // Blue
    //         const lightBlue = [240, 248, 255];

    //         let y = 20;

    //         // Header
    //         doc.setFont("helvetica", "bold");
    //         doc.setFontSize(22);
    //         doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    //         doc.text("FOOTBALL PLAYER BEHAVIOR TRAIT MAP", pageWidth / 2, y, { align: "center" });
    //         y += 10;

    //         // Horizontal line
    //         doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    //         doc.setLineWidth(0.5);
    //         doc.line(20, y, pageWidth - 20, y);
    //         y += 15;

    //         const playerName = playerInfo?.player_name || "Unknown Player";
    //         const overallScore = getOverallScore();

    //         // Player Info
    //         doc.setFont("helvetica", "normal");
    //         doc.setFontSize(14);
    //         doc.setTextColor(0, 0, 0);
    //         doc.text(`Player Name: ${playerName}`, 20, y);
    //         y += 8;

    //         doc.setFont("helvetica", "bold");
    //         doc.text(`Overall Score: ${overallScore}`, 20, y);
    //         y += 15;

    //         // Table 1: Competency Details
    //         doc.setFont("helvetica", "bold");
    //         doc.setFontSize(16);
    //         doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    //         doc.text("COMPETENCY DETAILS", 20, y);
    //         y += 10;

    //         const tableData = getCompetencyData().map(item => [
    //             item.sNo.toString(),
    //             item.competency,
    //             item.region || (user?.u_region === "africa" ? "Africa" : "Asia"),
    //             item.level,
    //             item.score,
    //             item.gap
    //         ]);

    //         autoTable(doc, {
    //             startY: y,
    //             head: [["S.No", "Competency", "Region", "Level", "Score", "Gap for Next Level"]],
    //             body: tableData,
    //             theme: "grid",
    //             headStyles: {
    //                 fillColor: primaryColor,
    //                 textColor: [255, 255, 255],
    //                 fontStyle: 'bold',
    //                 halign: 'center'
    //             },
    //             bodyStyles: {
    //                 fontSize: 10,
    //                 cellPadding: 3
    //             },
    //             columnStyles: {
    //                 0: { cellWidth: 15, halign: 'center' },
    //                 1: { cellWidth: 40, halign: 'left' },
    //                 2: { cellWidth: 25, halign: 'center' },
    //                 3: { cellWidth: 25, halign: 'center' },
    //                 4: { cellWidth: 25, halign: 'center' },
    //                 5: { cellWidth: 30, halign: 'center' }
    //             },
    //             margin: { left: 20, right: 20 },
    //             styles: { overflow: 'linebreak', cellWidth: 'wrap' }
    //         });

    //         y = doc.lastAutoTable.finalY + 20;

    //         // Check if new page needed
    //         if (y > pageHeight - 50) {
    //             doc.addPage();
    //             y = 20;
    //         }

    //         // Table 2: Competency Definitions
    //         doc.setFont("helvetica", "bold");
    //         doc.setFontSize(16);
    //         doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    //         doc.text("COMPETENCY DEFINITIONS", 20, y);
    //         y += 10;

    //         const definitionsData = getDefinitions();
    //         const definitionsTableBody = [];

    //         definitionsData.competencies.forEach(comp => {
    //             definitionsTableBody.push([
    //                 { content: comp, styles: { fontStyle: 'bold', fillColor: lightBlue } },
    //                 definitionsData.definitionsData[comp]
    //             ]);
    //         });

    //         autoTable(doc, {
    //             startY: y,
    //             head: [['Competency', 'Definition']],
    //             body: definitionsTableBody,
    //             theme: "grid",
    //             headStyles: {
    //                 fillColor: primaryColor,
    //                 textColor: [255, 255, 255],
    //                 fontStyle: 'bold',
    //                 halign: 'center'
    //             },
    //             bodyStyles: {
    //                 fontSize: 10,
    //                 cellPadding: 4,
    //                 lineWidth: 0.1
    //             },
    //             columnStyles: {
    //                 0: { cellWidth: 45, fontStyle: 'bold', fillColor: lightBlue },
    //                 1: { cellWidth: pageWidth - 70, halign: 'left' }
    //             },
    //             margin: { left: 20, right: 20 },
    //             styles: { overflow: 'linebreak', cellWidth: 'wrap' }
    //         });

    //         y = doc.lastAutoTable.finalY + 20;

    //         // Check if new page needed
    //         if (y > pageHeight - 50) {
    //             doc.addPage();
    //             y = 20;
    //         }

    //         // Table 3: Competency Levels
    //         doc.setFont("helvetica", "bold");
    //         doc.setFontSize(16);
    //         doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    //         doc.text("COMPETENCY LEVEL DESCRIPTIONS", 20, y);
    //         y += 10;

    //         const levelData = getCompetencyLevels();
    //         const levelTableBody = [];

    //         levelData.competencies.forEach(comp => {
    //             levelTableBody.push([
    //                 { content: comp, rowSpan: 4, styles: { fontStyle: 'bold', fillColor: lightBlue, valign: 'middle' } },
    //                 'Level 1',
    //                 levelData.levelsData[comp]['Level 1']
    //             ]);
    //             levelTableBody.push([
    //                 '',
    //                 'Level 2',
    //                 levelData.levelsData[comp]['Level 2']
    //             ]);
    //             levelTableBody.push([
    //                 '',
    //                 'Level 3',
    //                 levelData.levelsData[comp]['Level 3']
    //             ]);
    //             levelTableBody.push([
    //                 '',
    //                 'Level 4',
    //                 levelData.levelsData[comp]['Level 4']
    //             ]);
    //         });

    //         autoTable(doc, {
    //             startY: y,
    //             head: [['Competency', 'Level', 'Description']],
    //             body: levelTableBody,
    //             theme: "grid",
    //             headStyles: {
    //                 fillColor: primaryColor,
    //                 textColor: [255, 255, 255],
    //                 fontStyle: 'bold',
    //                 halign: 'center'
    //             },
    //             bodyStyles: {
    //                 fontSize: 9,
    //                 cellPadding: 3,
    //                 lineWidth: 0.1
    //             },
    //             columnStyles: {
    //                 0: { cellWidth: 40, fontStyle: 'bold', fillColor: lightBlue },
    //                 1: { cellWidth: 20, halign: 'center' },
    //                 2: { cellWidth: pageWidth - 75, halign: 'left' }
    //             },
    //             margin: { left: 20, right: 20 },
    //             styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    //             didParseCell: function (data) {
    //                 if (data.cell.raw === '') {
    //                     data.cell.styles = { fillColor: [255, 255, 255] };
    //                 }
    //             }
    //         });

    //         // Add page numbers to all pages
    //         const pageCount = doc.internal.getNumberOfPages();

    //         for (let i = 1; i <= pageCount; i++) {
    //             doc.setPage(i);

    //             // Footer with page number
    //             doc.setFontSize(10);
    //             doc.setTextColor(100, 100, 100);
    //             doc.setFont("helvetica", "normal");

    //             const footerY = pageHeight - 10;
    //             const footerText = `Page ${i} of ${pageCount}`;
    //             const footerX = pageWidth - doc.getTextWidth(footerText) - 20;

    //             doc.text(footerText, footerX, footerY);

    //             // Footer line
    //             doc.setDrawColor(200, 200, 200);
    //             doc.setLineWidth(0.2);
    //             doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    //             // Company/Report info in footer
    //             doc.setFontSize(9);
    //             doc.setTextColor(150, 150, 150);
    //             doc.text("Football Player Assessment Report", 20, footerY);
    //         }

    //         // Add timestamp
    //         doc.setPage(1);
    //         const timestamp = new Date().toLocaleString();
    //         doc.setFontSize(9);
    //         doc.setTextColor(150, 150, 150);
    //         doc.text(`Generated: ${timestamp}`, pageWidth - 70, 15);

    //         const fileName = `BehaviorTrait_${playerName.replace(/\s+/g, '_')}_${isAdmin ? 'Admin' : user?.u_region || 'coach'}.pdf`;
    //         doc.save(fileName);

    //     } catch (error) {
    //         console.error("PDF Generation Error:", error);
    //         alert("PDF generation failed. Please try again.");
    //     }
    // };

const generatePDF = async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const isAdmin = user?.role === "ADMIN";

        if ((isAdmin && !combinedData) || (!isAdmin && !traitData)) {
            alert("Data not available for PDF generation!");
            return;
        }

        // Logo shown on every page of the PDF
        const logoDataUrl = await fetch("/images/football-vector-free-11.png")
            .then((res) => res.blob())
            .then((blob) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }));
        const logoWidth = 20;
        const logoHeight = logoWidth * (608 / 1696); // preserve aspect ratio

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // PDF Styling
        const primaryColor = [39, 174, 96]; // Green
        const secondaryColor = [41, 128, 185]; // Blue
        const lightBlue = [240, 248, 255];

        let y = 20;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text("FOOTBALL PLAYER BEHAVIOR TRAIT MAP", pageWidth / 2, y, { align: "center" });
        y += 6;

        // Horizontal line
        doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setLineWidth(0.3);
        doc.line(15, y, pageWidth - 15, y);
        y += 10;

        const playerName = playerInfo?.player_name || "Unknown Player";
        const overallScore = getOverallScore();

        // Player Info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Player Name: ${playerName}`, 15, y);
        y += 5;

        doc.setFont("helvetica", "bold");
        doc.text(`Overall Score: ${overallScore}`, 15, y);
        y += 12;

        // Table 1: Competency Details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text("1. COMPETENCY DETAILS", 15, y);
        y += 6;

        const tableData = getCompetencyData().map(item => [
            item.sNo.toString(),
            item.competency,
            item.region || (user?.u_region === "africa" ? "Africa" : "Asia"),
            item.level,
            item.score,
            item.gap
        ]);

        autoTable(doc, {
            startY: y,
            head: [["S.No", "Competency", "Region", "Level", "Score", "Gap for Next Level"]],
            body: tableData,
            theme: "grid",
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 1.5,
                lineWidth: 0.1,
                lineColor: [180, 180, 180],
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: isAdmin ? 32 : 42, halign: 'left' },
                2: { cellWidth: isAdmin ? 18 : 0, halign: 'center' },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 18, halign: 'center' },
                5: { cellWidth: 22, halign: 'center' }
            },
            margin: { left: 15, right: 15 },
            styles: {
                overflow: 'linebreak',
                lineWidth: 0.1
            }
        });

        y = doc.lastAutoTable.finalY + 12;

        // Table 2: Competency Definitions
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text("2. COMPETENCY DEFINITIONS", 15, y);
        y += 6;

        const definitionsData = getDefinitions();
        const definitionsTableBody = definitionsData.competencies.map(comp => [
            { 
                content: comp, 
                styles: { 
                    fontStyle: 'bold', 
                    fillColor: [245, 245, 245],
                    valign: 'middle'
                } 
            },
            { 
                content: definitionsData.definitionsData[comp],
                styles: { valign: 'top' }
            }
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Competency', 'Definition']],
            body: definitionsTableBody,
            theme: "grid",
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 2,
                lineWidth: 0.1,
                lineColor: [180, 180, 180],
                valign: 'top'
            },
            columnStyles: {
                0: { 
                    cellWidth: 38, 
                    fontStyle: 'bold'
                },
                1: { 
                    cellWidth: pageWidth - 58,
                    halign: 'left'
                }
            },
            margin: { left: 15, right: 15 },
            styles: {
                overflow: 'linebreak',
                lineWidth: 0.1
            }
        });

        y = doc.lastAutoTable.finalY + 12;

        // Table 3: Competency Levels
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text("3. COMPETENCY LEVEL DESCRIPTIONS", 15, y);
        y += 6;

        const levelData = getCompetencyLevels();
        
        // ہر competency کے لیے علیحدہ ٹیبل بنائیں
        levelData.competencies.forEach((comp, index) => {
            // Check if we need a new page
            if (y > pageHeight - 60) {
                doc.addPage();
                y = 20;
            }

            // Competency title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text(`${index + 1}. ${comp}`, 15, y);
            y += 5;

            // Create table for this competency's levels
            const levelsTableBody = [
                [
                    { content: 'Level 1', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } },
                    { content: levelData.levelsData[comp]['Level 1'], styles: { fontSize: 7.5 } }
                ],
                [
                    { content: 'Level 2', styles: { fontStyle: 'bold', halign: 'center', fillColor: [245, 245, 245] } },
                    { content: levelData.levelsData[comp]['Level 2'], styles: { fontSize: 7.5 } }
                ],
                [
                    { content: 'Level 3', styles: { fontStyle: 'bold', halign: 'center', fillColor: [250, 250, 250] } },
                    { content: levelData.levelsData[comp]['Level 3'], styles: { fontSize: 7.5 } }
                ],
                [
                    { content: 'Level 4', styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
                    { content: levelData.levelsData[comp]['Level 4'], styles: { fontSize: 7.5 } }
                ]
            ];

            autoTable(doc, {
                startY: y,
                head: [['Level', 'Description']],
                body: levelsTableBody,
                theme: "grid",
                headStyles: {
                    fillColor: [52, 152, 219],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center',
                    fontSize: 8
                },
                bodyStyles: {
                    fontSize: 7.5,
                    cellPadding: 1.5,
                    lineWidth: 0.1,
                    lineColor: [180, 180, 180],
                    valign: 'top'
                },
                columnStyles: {
                    0: { 
                        cellWidth: 20,
                        halign: 'center'
                    },
                    1: { 
                        cellWidth: pageWidth - 40,
                        halign: 'left'
                    }
                },
                margin: { left: 15, right: 15 },
                styles: {
                    overflow: 'linebreak',
                    lineWidth: 0.1,
                    minCellHeight: 8
                }
            });

            y = doc.lastAutoTable.finalY + 10;
            
            // Add small space between competencies
            if (index < levelData.competencies.length - 1) {
                doc.setLineWidth(0.05);
                doc.setDrawColor(220, 220, 220);
                doc.line(15, y, pageWidth - 15, y);
                y += 5;
            }
        });

        // Add page numbers to all pages
        const pageCount = doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Footer with page number
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont("helvetica", "normal");

            const footerY = pageHeight - 8;
            const footerText = `Page ${i} of ${pageCount}`;
            const footerX = pageWidth - doc.getTextWidth(footerText) - 15;

            doc.text(footerText, footerX, footerY);

            // Footer line
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.1);
            doc.line(15, footerY - 4, pageWidth - 15, footerY - 4);

            // Company/Report info in footer
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text("Football Player Assessment Report", 15, footerY);

            // Add header on each page after first
            if (i > 1) {
                doc.setFontSize(9);
                doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
                doc.setFont("helvetica", "bold");
                doc.text("Football Player Behavior Trait Map", 15, 8);
                
                doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
                doc.setLineWidth(0.2);
                doc.line(15, 11, pageWidth - 15, 11);
            }
        }

        // Add the website logo to the top-right corner of every page
        const logoX = pageWidth - 15 - logoWidth;
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.addImage(logoDataUrl, 'PNG', logoX, 5, logoWidth, logoHeight);
        }

        // Add timestamp to first page (kept left of the logo)
        doc.setPage(1);
        const timestamp = new Date().toLocaleString();
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated: ${timestamp}`, logoX - 3 - doc.getTextWidth(`Generated: ${timestamp}`), 8);

        // Add generated by info
        const generatedBy = user?.name || user?.email || "User";
        doc.setFontSize(7);
        doc.text(`Generated by: ${generatedBy}`, 15, 8);

        const fileName = `Behavior_Trait_${playerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("PDF generation failed. Please check console for details.");
    }
};
    
    const competencyData = getCompetencyData();
    const definitionsData = getDefinitions();
    const levelData = getCompetencyLevels();

    if (loading) {
        return (
            <div className="modal-backdrop" style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050
            }}>
                <div className="text-white">Loading data...</div>
            </div>
        );
    }

    return (
        <div className="modal-backdrop" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050
        }}>
            <div className="modal-content bg-white rounded shadow-lg" ref={modalRef} style={{
                maxWidth: '1300px',
                width: '98%',
                pointerEvents: 'auto',
                backgroundColor: '#fff',
            }}>

                <div className="modal-header bg-light p-3 border-bottom">
                    <h5 className="modal-title text-dark">
                        <FiClipboard className="me-2 text-primary" />
                        Football Player Behavior Trait Map
                        {isAdmin && <span className="badge bg-danger ms-2">Admin View</span>}
                    </h5>
                </div>

                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                    <div className="card mb-4 shadow-sm border-0">
                        <div className="card-body bg-light rounded">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <p className="mb-1 text-primary"><FiUser className="me-2" /> Name:</p>
                                    <h6 className="fw-bold text-dark">{playerInfo.player_name || 'N/A'}</h6>
                                </div>
                                <div className="col-md-4">
                                    <p className="mb-1 text-primary"><FiStar className="me-2" /> Overall Scores:</p>
                                    <h6 className="fw-bold text-dark">{getOverallScore()}</h6>
                                </div>
                                <div className="col-md-4 text-end">
                                    <button className="btn btn-primary" onClick={generatePDF}>
                                        <FiDownload className="me-2" /> Download Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table 1: Competency Details */}
                    <h5 className="mb-3 text-secondary border-bottom pb-2">
                        Competency Details (Scores and Levels)
                    </h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="bg-primary text-white">
                                <tr>
                                    <th style={{ width: '5%', textAlign: 'center' }}>S.No</th>
                                    <th style={{ width: isAdmin ? '25%' : '30%' }}>Competency</th>
                                    {/* {isAdmin && <th style={{ width: '10%', textAlign: 'center' }}>Region</th>} */}
                                    <th style={{ width: isAdmin ? '15%' : '20%', textAlign: 'center' }}>Level</th>
                                    <th style={{ width: isAdmin ? '15%' : '20%', textAlign: 'center' }}>Score</th>
                                    <th style={{ width: isAdmin ? '20%' : '25%', textAlign: 'center' }}>Gap for Next Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competencyData.length > 0 ? (
                                    competencyData.map((item) => (
                                        <tr key={`${item.region || ''}-${item.sNo}`}>
                                            <td className="fw-bold text-center">{item.sNo}</td>
                                            <td>{item.competency}</td>
                                            {/* {isAdmin && (
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`badge ${item.region === 'Africa' ? 'bg-success' : 'bg-warning'}`}>
                                                        {item.region}
                                                    </span>
                                                </td>
                                            )} */}
                                            <td style={{ textAlign: 'center' }}>{item.level}</td>
                                            <td style={{ textAlign: 'center' }}>{item.score}</td>
                                            <td style={{ textAlign: 'center' }}>{item.gap}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted">No Competency Data Found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table 2: Competency Definitions */}
                    <h5 className="mb-3 text-secondary border-bottom pb-2 mt-4">
                        Competency Definitions (Description of Traits)
                    </h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="bg-success text-white">
                                <tr>
                                    <th style={{ width: '30%' }}>Competency</th>
                                    <th>Definition</th>
                                </tr>
                            </thead>
                            <tbody>
                                {definitionsData.competencies.map(comp => (
                                    <tr key={comp}>
                                        <td className="fw-bold bg-light">{comp}</td>
                                        <td style={{ whiteSpace: 'normal' }}>{definitionsData.definitionsData[comp]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table 3: Competency Level Descriptions */}
                    <h5 className="mb-3 text-secondary border-bottom pb-2 mt-4">
                        Competency Level Descriptions (Level 1 to 4)
                        {isAdmin && <small className="text-muted">(Based on Africa/Asia Master Data)</small>}
                    </h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="bg-info text-white">
                                <tr>
                                    <th style={{ width: '25%' }}>Competency</th>
                                    <th style={{ width: '15%' }}>Level</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {levelData.competencies.map(comp => (
                                    <React.Fragment key={comp}>
                                        <tr>
                                            <td rowSpan="4" className="fw-bold bg-light align-middle">{comp}</td>
                                            <td className="text-center">Level 1</td>
                                            <td style={{ whiteSpace: 'normal' }}>{levelData.levelsData[comp]['Level 1']}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-center">Level 2</td>
                                            <td style={{ whiteSpace: 'normal' }}>{levelData.levelsData[comp]['Level 2']}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-center">Level 3</td>
                                            <td style={{ whiteSpace: 'normal' }}>{levelData.levelsData[comp]['Level 3']}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-center">Level 4</td>
                                            <td style={{ whiteSpace: 'normal' }}>{levelData.levelsData[comp]['Level 4']}</td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="modal-footer p-3 border-top">
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                        <FiX className="me-2" /> Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BehaviorTraitModal;