// src/components/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css'; // Thêm file CSS cho spinner nếu muốn

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Đang tải...</p>
    </div>
  );
};

export default LoadingSpinner;
