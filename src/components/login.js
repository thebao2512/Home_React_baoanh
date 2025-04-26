// Login.js
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
    setLoading(true);

    if (!validateForm()) return;

    const baseUrl = process.env.REACT_APP_API_URL;
    const url = isAdmin
      ? `${baseUrl}/login`
      : isLogin
        ? `${baseUrl}/login`
        : `${baseUrl}/register`;

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
      console.log("Sending to backend:", payload);
      const response = await axios.post(url, payload, {
        timeout: 10000, // 10 giây timeout
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
      });

      const data = response.data;
      console.log("Response from backend:", data);

      if (data.success) {
        if (isAdmin || isLogin) {
          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.user.role === "student") {
            navigate("/student/dashboard");
          } else if (data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            alert("Vai trò không hợp lệ!");
          }
        } else {
          alert("Tạo tài khoản thành công!");
          setIsLogin(true);
        }
      } else {
        console.error("Login error:", data.message);
        alert(data.message || "Đăng nhập thất bại");
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        setErrors({ general: error.response.data.message || "Đăng nhập thất bại" });
      } else if (error.request) {
        alert("Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet hoặc thử lại sau.");
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        { email: formData.email, password: formData.password, role: isAdmin ? "admin" : "student" },
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      console.log('Response from backend:', response.data);

      if (response.data.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Chuyển hướng dựa trên role
        if (response.data.user.role === 'admin') {
          window.location.href = '/home';  // Sử dụng window.location.href thay vì navigate
        } else {
          window.location.href = '/student-home';
        }
      } else {
        setError(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setError(error.response.data.message || "Đăng nhập thất bại");
      } else if (error.request) {
        setError("Không thể kết nối đến máy chủ");
      } else {
        setError("Có lỗi xảy ra khi đăng nhập");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="shape-top-left"></div>
      <div className="shape-bottom-right"></div>
      <div className="form-container">
        <h1 className="form-title">
          {isAdmin ? "Login Admin" : isLogin ? "Sign In" : "Sign Up"}
        </h1>
        {errors.general && <div className="error-message">{errors.general}</div>}
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
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="mssv"
                  placeholder="MSSV"
                  value={formData.mssv}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.mssv && <p className="error-text">{errors.mssv}</p>}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="hoten"
                  placeholder="Họ tên"
                  value={formData.hoten}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.hoten && <p className="error-text">{errors.hoten}</p>}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="khoa"
                  placeholder="Khoa"
                  value={formData.khoa}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.khoa && <p className="error-text">{errors.khoa}</p>}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="lop"
                  placeholder="Lớp"
                  value={formData.lop}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.lop && <p className="error-text">{errors.lop}</p>}
              </div>
              <div className="input-group">
                <input
                  type="date"
                  name="ngaysinh"
                  value={formData.ngaysinh}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.ngaysinh && (
                  <p className="error-text">{errors.ngaysinh}</p>
                )}
              </div>
            </>
          )}
          {isAdmin && (
            <div className="toggle-text">
              <a href="#" className="toggle-link">
                Forget my password
              </a>
            </div>
          )}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : isAdmin ? "Login" : isLogin ? "Sign In" : "Create Account"}
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
          <button
            onClick={() => toggleRole("student")}
            className={`toggle-button ${!isAdmin ? "active" : ""}`}
          >
            Student
          </button>
          <button
            onClick={() => toggleRole("admin")}
            className={`toggle-button ${isAdmin ? "active" : ""}`}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;