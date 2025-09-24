import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/core/Dashboard/Sidebar";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { darkMode } = useSelector((state) => state.theme);

  return (
    <div
      className={`relative min-h-screen ${
        darkMode ? "bg-richblack-900" : "bg-richblack-5"
      }`}
    >
      {/* Nous n'avons pas besoin d'inclure <Sidebar /> ici car il contient déjà <Outlet /> */}
      {/* et gère déjà la mise en page responsive */}
      <Sidebar />
    </div>
  );
};

export default Dashboard;
