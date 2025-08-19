import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { getHomeRouteForLoggedInUser, getUserData } from './utils/Utils';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CitizenRegister from './pages/auth/CitizenRegister';
import AuthorityRegister from './pages/auth/AuthorityRegister';

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
