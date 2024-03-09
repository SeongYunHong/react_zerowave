// Modal.js
import React from 'react';
import './Modal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ onClose, children }) => {
  return (
    <div className="modal_v1 modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <section className='title_box'>
          <h2>My Page</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon className='icon' icon={faXmark} />
          </button>
        </section>
        <section className='modal_body'>{children}</section>
      </div>
    </div>
  );
};

export default Modal;
