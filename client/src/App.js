// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Task from "./pages/Task";
import Timesheet from "./pages/Timesheet";
import Projects from "./pages/Projects";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Holiday from "./pages/Holiday";
import Sidebar from "./components/Sidebar";
import { TimerProvider } from "./context/TimerContext";
import Appreciation from "./pages/Appreciation";
import Setting from "./pages/Setting";

function AppWrapper() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // Pages where sidebar should NOT be shown
  const noSidebarPages = ["/login", "/register", "/"];

  const showSidebar = !noSidebarPages.includes(location.pathname);

  return (
    <>
      <Header user={user} />
      <div className="flex min-h-screen">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/work/tasks" element={<Task />} />
            <Route path="/work/timesheet" element={<Timesheet />} />
            <Route path="/work/projects" element={<Projects/>}/>
            <Route path="/hr/attendance" element={<Attendance />} />
            <Route path="/hr/leaves" element={<Leaves/>} />
            <Route path="/hr/holiday" element={<Holiday/>} />
            <Route path="/hr/appreciation" element={<Appreciation/>} />
            <Route path="/settings" element={<Setting />} />

          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <TimerProvider>
        <AppWrapper />
      </TimerProvider>
    </Router>
  );
}

export default App;
