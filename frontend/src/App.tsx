import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { getHomeRouteForLoggedInUser, getUserData } from './utils/Utils';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CitizenRegister from './pages/auth/CitizenRegister';
import AuthorityRegister from './pages/auth/AuthorityRegister';
import RequiredUser from './components/RequiredUser';
import Issues from './pages/Issues';
import IssueSubmission from './pages/IssueSubmission';
import MyIssues from './pages/MyIssues';
import IssueDetails from './pages/IssueDetails';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminUser from './pages/AdminUser';
import AdminLogin from './pages/auth/AdminLogin';
import AdminUserEdit from './pages/AdminUserEdit';
import Teams from './pages/Teams';
import TeamCreate from './pages/TeamCreate';
import TeamUpdate from './pages/TeamUpdate';
import AuthorityNotifications from './pages/AuthorityNotifications';
import AuthorityTeamAssign from './pages/AuthorityTeamAssign';
import IssueUpdate from './pages/IssueUpdate';
import AuthorityTeamAssignUpdate from './pages/AuthorityTeamAssignUpdate';
import AuthorityIssueDetails from './pages/AuthorityIssueDetails';
import AuthorityAnalytics from './pages/AuthorityAnalytics';
import AdminModeration from './pages/AdminModeration';
import AdminReport from './pages/AdminReport';

const App: React.FC = () => {
  const getHomeRoute = () => {
    const user = getUserData()
    if (user) {
      return <Navigate to={getHomeRouteForLoggedInUser(user.role)} replace />;
    } else {
      return <Home />;
    }
  }
  return (
    <Suspense fallback={null}>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={getHomeRoute()} />
          <Route element={<RequiredUser allowedRoles={['Citizen']} />}>
            <Route path="citizen/issues" element={<Issues />} />
            <Route path="citizen/issues" element={<Issues />} />
            <Route path="citizen/issue-detail/:id" element={<IssueDetails />} />
            <Route path="citizen/my-issues" element={<MyIssues />} />
            <Route path="citizen/issues-submission" element={<IssueSubmission />} />
            <Route path="citizen/issues-update/:id" element={<IssueUpdate />} />
          </Route>
          <Route element={<RequiredUser allowedRoles={['Authority']} />}>
            <Route path="authority/dashboard" element={<AuthorityDashboard />} />
            <Route path="authority/notifications" element={<AuthorityNotifications />} />
            <Route path="authority/issue-detail/:id" element={<AuthorityIssueDetails />} />
            <Route path="authority/team-assigns" element={<AuthorityTeamAssign />} />
            <Route path="authority/team-assigns/assign/:id" element={<AuthorityTeamAssignUpdate />} />
            <Route path="authority/teams" element={<Teams />} />
            <Route path="authority/team-create" element={<TeamCreate />} />
            <Route path="authority/team-update/:id" element={<TeamUpdate />} />
            <Route path="authority/analytics" element={<AuthorityAnalytics />} />
          </Route>
          <Route element={<RequiredUser allowedRoles={['Admin']} />}>
            <Route path="admin/moderation" element={<AdminModeration />} />
            <Route path="admin/users" element={<AdminUser />} />
            <Route path="admin/report" element={<AdminReport />} />
            <Route path="admin/users/:id" element={<AdminUserEdit />} />
          </Route>
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="register-citizen" element={<CitizenRegister />} />
          <Route path="register-authority" element={<AuthorityRegister />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App;
