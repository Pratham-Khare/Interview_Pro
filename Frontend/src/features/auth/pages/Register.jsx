import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { loading, handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password) {
            setError("Please fill in all required fields.");
            return;
        }

        const result = await handleRegister({ username, email, password });

        if (!result?.success) {
            setError(result?.message || "Unable to create your account. Please try again.");
            return;
        }

        setError("");
        navigate("/");
    };

    if (loading) {
        return (
            <main className="auth-loading">
                <div className="spinner spinner-lg" aria-label="Loading application" />
            </main>
        );
    }

    return (
        <div className='auth-page'>
            <div className='auth-container'>
                
                {/* Left Side - Branding */}
                <div className='auth-brand'>
                    <div className='brand-logo'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        <span>InterviewForge</span>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className='auth-content'>
                    <div className='auth-card'>

                        {/* Header */}
                        <div className='auth-header'>
                            <h1 className='auth-title'>Create an account</h1>
                            <p className='auth-subtitle'>Enter your details to get started with your projects.</p>
                        </div>

                        {/* Error Banner */}
                        {error && (
                            <div className="alert alert-error" role="alert">
                                {error}
                            </div>
                        )}

                        {/* Register Form */}
                        <form className='auth-form' onSubmit={handleSubmit} noValidate>
                            
                            {/* Username Field */}
                            <div className='form-group'>
                                <label className='form-label' htmlFor="username">Username</label>
                                <div className='input-wrapper'>
                                    <input
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value) }}
                                        type="text"
                                        id="username"
                                        name='username'
                                        className='form-input'
                                        placeholder='johndoe'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className='form-group'>
                                <label className='form-label' htmlFor="email">Email address</label>
                                <div className='input-wrapper'>
                                    <input
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value) }}
                                        type="email"
                                        id="email"
                                        name='email'
                                        className='form-input'
                                        placeholder='name@company.com'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className='form-group'>
                                <label className='form-label' htmlFor="password">Password</label>
                                <div className='input-wrapper'>
                                    <input
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name='password'
                                        className='form-input form-input--password'
                                        placeholder='••••••••'
                                        required
                                    />
                                    <button
                                        type='button'
                                        className='password-toggle'
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button type='submit' className='auth-button' disabled={loading}>
                                {loading ? "Creating account..." : "Create account"}
                                {!loading && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                )}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <div className='auth-footer'>
                            <p>Already have an account? <Link to={"/login"} className='auth-link'>Sign in</Link></p>
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className='auth-copyright'>
                        <p>© 2026 InterviewForge LABS INC. ALL RIGHTS RESERVED.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;