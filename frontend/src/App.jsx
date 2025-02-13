import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/users/Dashboard";
import UserProfile from "./pages/UserProfile";
import Navbar from "./components/Navbar";
import ResetPassword from './components/ResetPassword';
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AudioUpload from "./pages/AudioUpload";
import AudioList from "./pages/users/AudioList";
import AdminAudioFiles from "./pages/admin/AdminAudioFiles";
import PrivateRoute from "./components/PrivateRoute";


const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <Routes>
        {/* Public route (login page) */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
          <Route path="/admin/users" element={<AdminUsers/>}/>
          <Route path="/admin/audio" element={<AdminAudioFiles/>} />
        </Route>

        <Route element={<PrivateRoute requiredRole="user" />}>
          <Route path="/dashboard" element={<Dashboard />}/>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/audio/upload" element={<AudioUpload />} />
          <Route path="/audio/list" element={<AudioList />} />
        </Route>


        {/* <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="admin-dashboard" element={<AdminDashboard/>}/>
          <Route path="admin/users" element={<AdminUsers/>}/>
          <Route path="/audio/upload" element={<AudioUpload />} />
          <Route path="/audio/list" element={<AudioList />} />
          <Route path="/admin/audio" element={<AdminAudioFiles/>} />
        </Route> */}
        

      </Routes>
    </div>
  );
};

export default App;
