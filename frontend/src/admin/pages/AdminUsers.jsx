import React, { useState, useEffect } from "react";
import adminService from "../services/adminService";
import toast from "react-hot-toast";
import { User, ShieldBan, ShieldCheck, Mail, Calendar } from "lucide-react";
import "../styles/Users.css";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { users } = await adminService.getAllUsers();
            setUsers(users);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        if (window.confirm(`Are you sure you want to ${isActive ? 'block' : 'unblock'} this user?`)) {
            try {
                await adminService.toggleUserStatus(id);
                toast.success(`User ${isActive ? 'blocked' : 'unblocked'} successfully`);
                fetchUsers();
            } catch (err) {
                toast.error("Failed to update status");
            }
        }
    };

    return (
        <div className="users-page">
            <div className="section-header">
                <h1>User Management</h1>
            </div>

            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ref</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Joined Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-avatar">{user.firstname[0]}</div>
                                    </td>
                                    <td className="user-name">{user.firstname} {user.lastname}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Mail size={14} className="text-gray-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`user-status-badge ${user.isActive ? 'status-active' : 'status-blocked'}`}>
                                            {user.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`action-btn ${user.isActive ? 'delete-btn' : 'edit-btn'}`}
                                            title={user.isActive ? "Block User" : "Unblock User"}
                                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                                        >
                                            {user.isActive ? <ShieldBan size={16} /> : <ShieldCheck size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
