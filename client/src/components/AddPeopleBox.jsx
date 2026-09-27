import React, { useState } from 'react';
import AddUserModal from './AddUserModal';

const AddPeopleBox = ({ onAddUser, className = "", style = {} }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddUser = async (userData) => {
    console.log('handleAddUser called with:', userData);
    if (onAddUser) {
      try {
        await onAddUser(userData);
        console.log('onAddUser completed successfully');
      } catch (error) {
        console.error('Error in onAddUser:', error);
      }
    }
    setShowModal(false);
  };

  return (
    <>
      {/* Small Add People Box */}
      <div 
        className={`add-people-box ${className}`}
        style={{
          ...style,
          display: 'inline-block'
        }}
      >
        <button
          className="btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center add-people-btn"
          onClick={() => {
            console.log('Add People button clicked');
            setShowModal(true);
          }}
          style={{
            fontSize: '17px',
            fontWeight: '600',
            border: 'none',
            background: '#FFFFFF',
            color: '#007ACC',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <i className="bi bi-person-plus me-2" style={{fontSize: '14px'}}></i>
          <span>Add People</span>
        </button>
      </div>

      {/* Modal */}
      <AddUserModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddUser={handleAddUser}
      />
    </>
  );
};

export default AddPeopleBox;