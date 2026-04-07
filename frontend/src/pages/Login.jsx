import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail, getValidationErrors, sanitizeInput } from "../utils/validation.js";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login, signInWithOAuth } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        const emailErrors = getValidationErrors('email', email);
        const passwordErrors = getValidationErrors('password', password);

        if (emailErrors.length > 0) errors.email = emailErrors[0];
        if (passwordErrors.length > 0) errors.password = passwordErrors[0];

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setError("");
        setLoading(true);

        try {
            const result = await login(sanitizeInput(email), password);
            if (result.success) {
                navigate("/chat");
            } else {
                setError(result.error || "Login failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider) => {
        setError("");
        setFieldErrors({});
        setLoading(true);

        try {
            const result = await signInWithOAuth(provider);
            if (!result.success) {
                setError(result.error || `${provider} login failed`);
            }
        } catch (err) {
            setError(`${provider} login failed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>💬 ChatApp</h1>
                    <p>Welcome back! Sign in to continue</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                {/* OAuth Login Buttons */}
                <div className="oauth-section">
                    <button
                        className="oauth-btn google-btn"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                    >
                        <span className="oauth-icon">🔍</span>
                        Continue with Google
                    </button>

                    <button
                        className="oauth-btn github-btn"
                        onClick={() => handleOAuthLogin('github')}
                        disabled={loading}
                    >
                        <span className="oauth-icon">🐙</span>
                        Continue with GitHub
                    </button>
                </div>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) {
                                    setFieldErrors({ ...fieldErrors, email: '' });
                                }
                            }}
                            required
                            disabled={loading}
                            className={fieldErrors.email ? 'error' : ''}
                        />
                        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (fieldErrors.password) {
                                    setFieldErrors({ ...fieldErrors, password: '' });
                                }
                            }}
                            required
                            disabled={loading}
                            className={fieldErrors.password ? 'error' : ''}
                        />
                        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
