import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBasket, Users, LogOut } from "lucide-react";
import { useAuth } from "../../user/hooks/useAuth";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const { handleLogOut } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBasket },
    { name: "Users", path: "/admin/users", icon: Users },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-logo">
        Lumina<span>Admin</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogOut} className="sidebar-item" style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
          <LogOut size={20} />
          <span>Exit Admin</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
