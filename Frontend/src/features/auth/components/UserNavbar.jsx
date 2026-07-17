import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

const UserNavbar = () => {
    const { user, handleLogout, loading } = useAuth();
    const navigate = useNavigate();

    const initials = user?.username
        ? user.username
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U";

    return (
        <header className="navbar no-print">
            <div className="navbar-container">
                <div
                    className="navbar-brand"
                    onClick={() => navigate("/")}
                    style={{ cursor: "pointer" }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    <span>InterviewForge</span>
                </div>

                {user && (
                    <div className="user-section">

                        <div className="user-info">

                            <div className="avatar">
                                {user?.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt="avatar" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>

                            <div className="user-text">
                                <div className="username">{user.username}</div>
                                <div className="email">{user.email}</div>
                            </div>

                        </div>

                        <div className="token-badge">
                            ⚡ {user?.tokens ?? 0} Tokens
                        </div>

                        <div className="navbar-actions">

                            <button
                                className="nav-btn"
                                onClick={() => navigate("/settings")}
                            >
                                Settings
                            </button>

                            <button
                                className="nav-btn"
                                onClick={() => navigate("/subscription")}
                            >
                                Subscription
                            </button>

                            <button
                                className="nav-btn logout"
                                onClick={handleLogout}
                                disabled={loading}
                            >
                                Logout
                            </button>

                        </div>

                    </div>
                )}
            </div>
        </header>
    );
};

export default UserNavbar;