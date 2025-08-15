import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { getHomeRouteForLoggedInUser, getUserData } from './utils/Utils';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

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
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App;
