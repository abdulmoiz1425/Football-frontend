import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/authentication/ProtectedRoute";
import RootLayout from "../layout/root";
import Home from "../pages/home";
import LoginMinimal from "../pages/login";
import LayoutAuth from "../layout/layoutAuth";
import FallbackRoute from "../components/authentication/FallbackRoute";
import LoginRoute from "../components/authentication/LoginRoute";
import AuthCallback from "../pages/AuthCallback";
import PlayesTable from "../pages/players-list";
import EvaluationForm from "../pages/Evaluation";
import PlayerStatsForm from "../components/Players/PlayerStatsForm";
import MatchTable from "../pages/Match-table";
import Coach from "../pages/coach";
import Reports from "../pages/reports";
import Howtouse from "../pages/howtouse";
import EvaluateResult from "../pages/Evaluat-result";
import AdminTraitScores from "@/components/Players/AdminTraitScores";
import PlayerProfile from "../pages/Player-Profile";
import AddPlayerStats from "../pages/Players-stats";
import PastPlayerStats from "../pages/PastPlayer-Stats";
import TeamsTable from "../pages/Player-Teams";
import ViewTeamP from "../pages/View-teamplayer";
import AddTeamStat from "../pages/team-stats";
import Comparison from "../pages/Comparison";
import TeamComparison from "../pages/teamComparison";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {

                path: "/",

                element: (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                )
            },
            {
                path: "/match-table",
                element: (
                    <ProtectedRoute>
                        <MatchTable />
                    </ProtectedRoute>
                )
            },
            {
                path: "/coaches",
                element: (
                    <ProtectedRoute>
                        <Coach />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/report",
                element: (
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                ),
            },

            {
                path: "/howtouse",
                element: (
                    <ProtectedRoute>
                        <Howtouse />
                    </ProtectedRoute>
                )
            },
            {
                path: "/Player-managment",
                element: (
                    <ProtectedRoute>
                        <PlayesTable />
                    </ProtectedRoute>
                )
            },
            {
                path: "/player/profile/:id",
                element: (
                    <ProtectedRoute>
                        <PlayerProfile />
                    </ProtectedRoute>
                )
            },

            {
                path: "/players/:playerId/trait-scores",

                element: (
                    <ProtectedRoute>
                        <AdminTraitScores />
                    </ProtectedRoute>
                )
            },

            {
                path: "/playerstats/:id",
                element: (
                    <ProtectedRoute>
                        <AddPlayerStats />
                    </ProtectedRoute>
                )
            },
            {
                path: "/teamstats/:id",
                element: (
                    <ProtectedRoute>
                        <AddTeamStat />
                    </ProtectedRoute>
                )
            },
            {
                path: "/pastplayerstats/:id",
                element: (
                    <ProtectedRoute>
                        <PastPlayerStats />
                    </ProtectedRoute>
                )
            },
            {
                path: "/coach/evaluate/:id",
                element: (
                    <ProtectedRoute>
                        <EvaluateResult />
                    </ProtectedRoute>
                )
            },
            {
                path: "/player-comparison/:id",
                element: (
                    <ProtectedRoute>
                        <Comparison />
                    </ProtectedRoute>
                )
            },
            {
                path: "/team-comparison/:id",
                element: (
                    <ProtectedRoute>
                        <TeamComparison />
                    </ProtectedRoute>
                )
            },
            {
                path: "/coach/teams/",
                element: (
                    <ProtectedRoute>
                        <TeamsTable />
                    </ProtectedRoute>
                )
            },
            {
                path: "/team/players/:teamId",
                element: (
                    <ProtectedRoute>
                        <ViewTeamP />
                    </ProtectedRoute>
                )
            },





        ]
    },

    {
        path: "/",
        element: <LayoutAuth />,
        children: [
            {
                path: "/coach/evaluations/:id",
                element: (

                    <EvaluationForm />

                )
            },
            {
                path: "/player-stats/:id",
                element: (

                    <PlayerStatsForm />

                )
            },
            {
                path: "/login",
                element: (
                    <LoginRoute>
                        <LoginMinimal />
                    </LoginRoute>
                ),
            },
            // {
            //     path: "/register",
            //     element: <RegisterCover />
            // },
            {
                path: "*",
                element: <FallbackRoute />,
            },


            {
                path: "/auth/callback",
                element: <AuthCallback />
            },

        ]
    }


])