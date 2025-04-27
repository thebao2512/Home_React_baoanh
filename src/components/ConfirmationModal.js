// src/components/ConfirmationModal.js
import React from 'react';
import './ConfirmationModal.css'; // Nếu bạn có thêm style cho modal

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h3>Confirmation</h3>
          <p>{message}</p>
          <div className="modal-actions">
            <button onClick={onConfirm} className="confirm-button">Confirm</button>
            <button onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
