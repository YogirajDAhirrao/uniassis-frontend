import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  Shield,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const COURSES = [
  { id: 2, name: "BE" },
  { id: 3, name: "BCA" },
  { id: 4, name: "MCA" },
  { id: 5, name: "ME" },
  { id: 6, name: "BA" },
];

export default function RegisterPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    courseId: "2",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "At least 6 characters required";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const data = await register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        role: form.role,
        courseId: form.courseId,
      });
      loginSuccess(data.accessToken, data.user);
      toast.success(`Welcome to UniAssist, ${data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
      if (msg.includes("email") || msg.includes("exists")) {
        setErrors({ email: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "var(--bg)", paddingTop: "72px" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded"
              style={{ background: "var(--navy)" }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-lg font-semibold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: "var(--navy)",
              }}
            >
              UniAssist
            </span>
          </Link>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Create your account
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="register-name"
              label="Full name"
              type="text"
              icon={User}
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange("name")}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              id="register-email"
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
              autoComplete="email"
            />

            {/* Password */}
            <div className="w-full">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="register-password"
                style={{ color: "var(--text-base)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="register-password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={`form-input pl-9 pr-9 ${errors.password ? "error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="w-full">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="register-confirm-password"
                style={{ color: "var(--text-base)" }}
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="register-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={`form-input pl-9 ${errors.confirmPassword ? "error" : ""}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Course selector */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="register-course"
                style={{ color: "var(--text-base)" }}
              >
                Your Course / Branch
              </label>
              <select
                id="register-course"
                value={form.courseId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, courseId: e.target.value }))
                }
                className="form-input"
              >
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selector */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-base)" }}
              >
                Account type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "student",
                    label: "Student",
                    icon: GraduationCap,
                    desc: "Chat & learn",
                  },
                  {
                    value: "admin",
                    label: "Administrator",
                    icon: Shield,
                    desc: "Manage documents",
                  },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value}`}
                    onClick={() => setForm((p) => ({ ...p, role: value }))}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded text-center transition-colors duration-150"
                    style={{
                      border:
                        form.role === value
                          ? "2px solid var(--navy)"
                          : "2px solid var(--border)",
                      background:
                        form.role === value ? "var(--accent-bg)" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color:
                          form.role === value
                            ? "var(--navy)"
                            : "var(--text-muted)",
                      }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color:
                          form.role === value
                            ? "var(--navy)"
                            : "var(--text-base)",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              id="register-submit-btn"
            >
              Create Account
            </Button>
          </form>

          <div
            className="mt-5 pt-5 text-center text-sm"
            style={{
              borderTop: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent)", fontWeight: 500 }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
