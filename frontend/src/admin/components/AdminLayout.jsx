import React from "react";
import Sidebar from "./Sidebar";
import "../styles/AdminGlobal.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="admin-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
