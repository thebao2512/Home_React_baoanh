import React, { useState } from "react";
import "./login.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    mssv: "",
    hoten: "",
    khoa: "",
    lop: "",
    ngaysinh: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://backend-zw3r.onrender.com";  // Đảm bảo API_URL đúng cho backend của bạn

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isAdmin && !isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.mssv) newErrors.mssv = "MSSV is required";
      if (!formData.hoten) newErrors.hoten = "Họ tên is required";
      if (!formData.khoa) newErrors.khoa = "Khoa is required";
      if (!formData.lop) newErrors.lop = "Lớp is required";
      if (!formData.ngaysinh) newErrors.ngaysinh = "Ngày sinh is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const endpoint = isAdmin
      ? `${API_URL}/login`
      : isLogin
      ? `${API_URL}/login`
      : `${API_URL}/register`;

    const payload = {
      email: formData.email,
      password: formData.password,
      role: isAdmin ? "admin" : "student",
      ...(isAdmin || isLogin
        ? {}
        : {
            mssv: formData.mssv,
            hoten: formData.hoten,
            khoa: formData.khoa,
            lop: formData.lop,
            ngaysinh: formData.ngaysinh,
          }),
    };

    try {
      const response = await axios.post(endpoint, payload, {
        timeout: 10000,
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Chuyển hướng theo vai trò người dùng
        if (response.data.user.role === "admin") {
          navigate("/home");
        } else {
          navigate("/student-home");
        }
      } else {
        setError(response.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.message || "Đăng nhập thất bại");
      } else {
        setError("Không thể kết nối đến server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      mssv: "",
      hoten: "",
      khoa: "",
      lop: "",
      ngaysinh: "",
    });
  };

  const toggleRole = (role) => {
    setIsAdmin(role === "admin");
    setIsLogin(true);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      mssv: "",
      hoten: "",
      khoa: "",
      lop: "",
      ngaysinh: "",
    });
  };

  return (
    <div className="login-container">
      <div className="shape-top-left"></div>
      <div className="shape-bottom-right"></div>
      <div className="form-container">
        <h1 className="form-title">
          {isAdmin ? "Login Admin" : isLogin ? "Sign In" : "Sign Up"}
        </h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="email"
              placeholder={isAdmin ? "Username" : "Email Address"}
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {!isAdmin && !isLogin && (
            <>
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>
              {/* Các input bổ sung cho student */}
              <div className="input-group">
                <input type="text" name="mssv" placeholder="MSSV" value={formData.mssv} onChange={handleChange} className="input-field" />
                {errors.mssv && <p className="error-text">{errors.mssv}</p>}
              </div>
              <div className="input-group">
                <input type="text" name="hoten" placeholder="Họ tên" value={formData.hoten} onChange={handleChange} className="input-field" />
                {errors.hoten && <p className="error-text">{errors.hoten}</p>}
              </div>
              <div className="input-group">
                <input type="text" name="khoa" placeholder="Khoa" value={formData.khoa} onChange={handleChange} className="input-field" />
                {errors.khoa && <p className="error-text">{errors.khoa}</p>}
              </div>
              <div className="input-group">
                <input type="text" name="lop" placeholder="Lớp" value={formData.lop} onChange={handleChange} className="input-field" />
                {errors.lop && <p className="error-text">{errors.lop}</p>}
              </div>
              <div className="input-group">
                <input type="date" name="ngaysinh" value={formData.ngaysinh} onChange={handleChange} className="input-field" />
                {errors.ngaysinh && <p className="error-text">{errors.ngaysinh}</p>}
              </div>
            </>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : isAdmin ? "Login" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {!isAdmin && (
          <div className="toggle-text">
            <p>
              {isLogin ? "Don't have an account? " : "Already Have An Account? "}
              <button onClick={toggleForm} className="toggle-link">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        )}

        <div className="toggle-text">
          <button onClick={() => toggleRole("student")} className={`toggle-button ${!isAdmin ? "active" : ""}`}>
            Student
          </button>
          <button onClick={() => toggleRole("admin")} className={`toggle-button ${isAdmin ? "active" : ""}`}>
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
