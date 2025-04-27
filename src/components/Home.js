import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'; // Import spinner component
import ConfirmationModal from './ConfirmationModal'; // Modal component for confirmation

function Home() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState({ mssv: "", hoten: "", lop: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState({
    mssv: "",
    hoten: "",
    khoa: "",
    lop: "",
    ngaysinh: "",
  });
  const [deletingStudent, setDeletingStudent] = useState(null); // Track student to delete

  const navigate = useNavigate();

  // Lấy danh sách sinh viên từ server
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get-students`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        setFilteredStudents(data.students);
      } else {
        toast.error("Không thể tải danh sách sinh viên");
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
      toast.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Xử lý tìm kiếm sinh viên
  const handleSearch = (e) => {
    const { name, value } = e.target;
    const newSearch = { ...search, [name]: value };
    setSearch(newSearch);

    if (Object.values(newSearch).every((val) => val === "")) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const matchMSSV =
        newSearch.mssv === "" ||
        student.mssv.toLowerCase().includes(newSearch.mssv.toLowerCase());
      const matchHoTen =
        newSearch.hoten === "" ||
        student.hoten.toLowerCase().includes(newSearch.hoten.toLowerCase());
      const matchLop =
        newSearch.lop === "" ||
        student.lop.toLowerCase().includes(newSearch.lop.toLowerCase());

      return matchMSSV && matchHoTen && matchLop;
    });

    setFilteredStudents(filtered);
  };

  // Thay đổi giá trị input trong form thêm sinh viên
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm sinh viên mới
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !student.mssv ||
      !student.hoten ||
      !student.khoa ||
      !student.lop ||
      !student.ngaysinh
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        mssv: student.mssv,
        hoten: student.hoten,
        khoa: student.khoa,
        lop: student.lop,
        ngaysinh: student.ngaysinh
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/add-student`, requestData);

      if (response.status === 200) {
        toast.success(response.data.message || "Thêm sinh viên thành công");
        setStudent({ mssv: "", hoten: "", khoa: "", lop: "", ngaysinh: "" });
        setShowAddForm(false);
        fetchStudents(); // Refresh list after adding
      } else {
        throw new Error(response.data.error || "Không thể thêm sinh viên");
      }
    } catch (error) {
      console.error('Lỗi khi thêm sinh viên:', error);
      toast.error(error.response?.data?.error || "Không thể thêm sinh viên");
    } finally {
      setLoading(false);
    }
  };

  // Xóa sinh viên
  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/delete-student`, { mssv: deletingStudent });

      if (response.data.message) {
        setStudents(students.filter(student => student.mssv !== deletingStudent));
        setFilteredStudents(filteredStudents.filter(student => student.mssv !== deletingStudent));
        toast.success("Xóa sinh viên thành công!");
        setDeletingStudent(null); // Reset after deletion
      } else {
        throw new Error(response.data.error || "Không thể xóa sinh viên");
      }
    } catch (error) {
      console.error('Lỗi khi xóa sinh viên:', error);
      toast.error(error.response?.data?.error || "Không thể xóa sinh viên");
    }
  };

  return (
    <div className="main-content">
      <h2>Danh sách sinh viên</h2>

      <div className="search-area">
        <input
          type="text"
          name="mssv"
          placeholder="MSSV"
          value={search.mssv}
          onChange={handleSearch}
        />
        <input
          type="text"
          name="hoten"
          placeholder="Họ Tên"
          value={search.hoten}
          onChange={handleSearch}
        />
        <input
          type="text"
          name="lop"
          placeholder="Lớp"
          value={search.lop}
          onChange={handleSearch}
        />
        <button className="add-button" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Ẩn Form" : "Thêm Sinh Viên"}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Thêm sinh viên mới</h3>
          <form onSubmit={handleAddStudent}>
            <input
              type="text"
              name="mssv"
              placeholder="MSSV"
              value={student.mssv}
              onChange={handleChange}
              required
              maxLength="20"
            />
            <input
              type="text"
              name="hoten"
              placeholder="Họ Tên"
              value={student.hoten}
              onChange={handleChange}
              required
              maxLength="100"
            />
            <input
              type="text"
              name="khoa"
              placeholder="Khoa"
              value={student.khoa}
              onChange={handleChange}
              required
              maxLength="50"
            />
            <input
              type="text"
              name="lop"
              placeholder="Lớp"
              value={student.lop}
              onChange={handleChange}
              required
              maxLength="50"
            />
            <input
              type="date"
              name="ngaysinh"
              value={student.ngaysinh}
              onChange={handleChange}
              required
            />
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Thêm"}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <LoadingSpinner />}

      <table className="student-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>MSSV</th>
            <th>Họ Tên</th>
            <th>Khoa</th>
            <th>Lớp</th>
            <th>Ngày Sinh</th>
            <th>Quản Lý</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <tr key={student.mssv}>
                <td>{index + 1}</td>
                <td>{student.mssv}</td>
                <td>{student.hoten}</td>
                <td>{student.khoa}</td>
                <td>{student.lop}</td>
                <td>{student.ngaysinh}</td>
                <td className="action-buttons">
                  <button
                    className="edit-button"
                    onClick={() => navigate(`/editstudent/${student.mssv}`)}
                    disabled={loading}
                  >
                    Sửa
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => setDeletingStudent(student.mssv)}
                    disabled={loading}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                {loading ? "Đang tải dữ liệu..." : "Không có sinh viên nào"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {deletingStudent && (
        <ConfirmationModal
          message="Bạn có chắc chắn muốn xóa sinh viên này?"
          onConfirm={handleDeleteStudent}
          onCancel={() => setDeletingStudent(null)}
        />
      )}

      <div className="action-buttons">
        <Link to="/group-management" className="group-management-btn">
          Quản Lý Nhóm
        </Link>
      </div>
    </div>
  );
}

export default Home;
