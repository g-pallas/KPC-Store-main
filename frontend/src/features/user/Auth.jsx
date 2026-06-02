import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Layout } from "../../components/shared";

export function Auth({ store, mode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    try {
      await store.login(form.email, form.password, mode, form.name);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout store={store}>
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === "register" ? "Create Account" : "Login"}</h1>
        {error && <p className="error">{error}</p>}
        {mode === "register" && (
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Password
          <span className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              minLength="8"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
        </label>
        <button className="wide-button">
          {mode === "register" ? "Register" : "Login"}
        </button>
        <p>
          {mode === "register" ? (
            <Link to="/login">Already have an account?</Link>
          ) : (
            <Link to="/register">Create a customer account</Link>
          )}
        </p>
        <small>Demo admin: admin@kpc.test / password</small>
      </form>
    </Layout>
  );
}
