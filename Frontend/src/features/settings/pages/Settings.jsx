import React, { useEffect, useState } from "react";
import UserNavbar from "../../auth/components/UserNavbar";
import {
    fetchSettings,
    updateAccountSettings,
    updateAppearanceSettings,
    updateNotificationSettings,
    fetchSessions,
    deleteAccount,
    uploadProfilePicture
} from "../services/settings.api";
import { useNavigate } from "react-router"


const SECTIONS = [
    "Account",
    "Appearance",
    "Notifications",
    "Security",
    "Danger Zone"
];

const Settings = () => {
    const [activeSection, setActiveSection] = useState("Account");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: "",
        email: "",
        profilePictureUrl: "",
        theme: "dark",
        emailAlertsEnabled: true,
    });

    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchSettings();
                setForm((prev) => ({
                    ...prev,
                    ...data.settings
                }));
                const s = await fetchSessions();
                setSessions(s.sessions || []);
            } catch (e) {
                setError(e?.response?.data?.message || "Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAccountSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await updateAccountSettings({
                name: form.name,
                email: form.email,
                profilePictureUrl: form.profilePictureUrl
            });
            setSuccess("Account settings updated.");
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to update account settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleAppearanceSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await updateAppearanceSettings({ theme: form.theme });
            setSuccess("Appearance updated.");
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to update appearance.");
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationsSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await updateNotificationSettings({ emailAlertsEnabled: form.emailAlertsEnabled });
            setSuccess("Notification preferences updated.");
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to update notifications.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "This will permanently delete your account and all interview reports. This action cannot be undone. Continue?"
        );
        if (!confirmed) return;

        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await deleteAccount();
            window.location.href = "/login";
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to delete account.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        try {
            setSaving(true);

            const res = await uploadProfilePicture(file);

            setForm({
                ...form,
                profilePictureUrl: res.profilePictureUrl
            });

            setSuccess("Profile picture uploaded.");

        } catch (err) {
            setError("Upload failed.");
        } finally {
            setSaving(false);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case "Account":
                return (
                    <div className="card card-glass">
                        <div className="card-header">
                            <h2>Account</h2>
                            <p className="text-secondary">Manage your basic profile information.</p>
                        </div>
                        <div className="card-body d-flex flex-column gap-3">
                            <div>
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Profile Picture</label>

                                {form.profilePictureUrl && (
                                    <img
                                        src={form.profilePictureUrl}
                                        alt="avatar"
                                        style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 10 }}
                                    />
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>
                        <div className="card-footer d-flex justify-end">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleAccountSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </div>
                );
            
            case "Appearance":
                return (
                    <div className="card card-glass">
                        <div className="card-header">
                            <h2>Appearance</h2>
                            <p className="text-secondary">Switch between dark and light themes.</p>
                        </div>
                        <div className="card-body">
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className={`btn btn-sm ${form.theme === "dark" ? "btn-primary" : "btn-outline"}`}
                                    onClick={() => setForm({ ...form, theme: "dark" })}
                                >
                                    Dark
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${form.theme === "light" ? "btn-primary" : "btn-outline"}`}
                                    onClick={() => setForm({ ...form, theme: "light" })}
                                >
                                    Light
                                </button>
                            </div>
                        </div>
                        <div className="card-footer d-flex justify-end">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleAppearanceSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </div>
                );
            case "Notifications":
                return (
                    <div className="card card-glass">
                        <div className="card-header">
                            <h2>Notifications</h2>
                            <p className="text-secondary">Control how you receive updates.</p>
                        </div>
                        <div className="card-body">
                            <label className="d-flex align-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.emailAlertsEnabled}
                                    onChange={(e) =>
                                        setForm({ ...form, emailAlertsEnabled: e.target.checked })
                                    }
                                />
                                <span>Email alerts for new interview plans</span>
                            </label>
                        </div>
                        <div className="card-footer d-flex justify-end">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleNotificationsSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </div>
                );
            case "Security":
                return (
                    <div className="card card-glass">
                        <div className="card-header">
                            <h2>Security</h2>
                            <p className="text-secondary">Review your active session.</p>
                        </div>
                        <div className="card-body">
                            {sessions.map((session) => (
                                <div key={session.id} className="d-flex flex-column mb-2">
                                    <span className="fw-semibold">
                                        {session.current ? "Current session" : "Session"}
                                    </span>
                                    <span className="text-secondary">{session.device}</span>
                                    <span className="text-muted">IP: {session.ip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "Danger Zone":
                return (
                    <div className="card card-glass">
                        <div className="card-header">
                            <h2>Danger Zone</h2>
                            <p className="text-secondary">
                                Permanently delete your account and all interview plans.
                            </p>
                        </div>
                        <div className="card-body">
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDeleteAccount}
                                disabled={saving}
                            >
                                {saving ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <main className="auth-loading">
                <div className="spinner spinner-lg" aria-label="Loading settings" />
            </main>
        );
    }

    return (
        <div className="home-page">
            <UserNavbar />
            <button className="back-button" onClick={() => navigate(-1)}>
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                </svg>
            </button>
            <div className="home-container">
                <div className="form-grid">
                    <aside className="card card-glass">
                        <div className="card-header">
                            <h2>Settings</h2>
                        </div>
                        <div className="card-body">
                            <nav className="d-flex flex-column gap-2">
                                {SECTIONS.map((section) => (
                                    <button
                                        key={section}
                                        type="button"
                                        className={`btn btn-ghost justify-start ${activeSection === section ? "text-primary" : ""
                                            }`}
                                        onClick={() => {
                                            setActiveSection(section);
                                            setError("");
                                            setSuccess("");
                                        }}
                                    >
                                        {section}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <section className="form-card form-card--right">
                        {error && (
                            <div className="alert alert-error mb-2" role="alert">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success mb-2" role="status">
                                {success}
                            </div>
                        )}
                        {renderContent()}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;

