import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { TrainingPlansProvider } from './context/TrainingPlansContext.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'
import Login from './pages/Login.jsx'
import Workout from './pages/Workout.jsx'
import WorkoutSession from './pages/WorkoutSession.jsx'
import MyTraining from './pages/MyTraining.jsx'
import PlanForm from './pages/PlanForm.jsx'
import MyHistory from './pages/MyHistory.jsx'
import SessionEditor from './pages/SessionEditor.jsx'
import MyProgress from './pages/MyProgress.jsx'
import Coach from './pages/Coach.jsx'
import CoachAthlete from './pages/CoachAthlete.jsx'
import CoachPlanForm from './pages/CoachPlanForm.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <TrainingPlansProvider>
                <AppDataProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/workout" replace />} />

                      <Route path="/workout" element={<Workout />} />
                      <Route path="/workout/:planId" element={<WorkoutSession />} />

                      <Route path="/mytraining" element={<MyTraining />} />
                      <Route path="/mytraining/new" element={<PlanForm />} />
                      <Route path="/mytraining/:id/edit" element={<PlanForm />} />

                      <Route path="/history" element={<MyHistory />} />
                      <Route path="/history/new" element={<SessionEditor />} />
                      <Route path="/history/:id/edit" element={<SessionEditor />} />

                      <Route path="/progress" element={<MyProgress />} />

                      <Route
                        path="/coach"
                        element={
                          <RequireAdmin>
                            <Coach />
                          </RequireAdmin>
                        }
                      />
                      <Route
                        path="/coach/:athleteId"
                        element={
                          <RequireAdmin>
                            <CoachAthlete />
                          </RequireAdmin>
                        }
                      />
                      <Route
                        path="/coach/:athleteId/new"
                        element={
                          <RequireAdmin>
                            <CoachPlanForm />
                          </RequireAdmin>
                        }
                      />

                      <Route path="*" element={<Navigate to="/workout" replace />} />
                    </Routes>
                  </Layout>
                </AppDataProvider>
              </TrainingPlansProvider>
            </RequireAuth>
          }
        />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
