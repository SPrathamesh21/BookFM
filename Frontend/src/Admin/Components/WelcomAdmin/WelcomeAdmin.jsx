import React from 'react';
import './WelcomeAdmin.css';
// import AdminImage from '../../../../assets/AdminImage.png';

const WelcomeAdmin = () => {
  return (
    <div className='uniqueadmin-overflow-hidden'>
      <div className="uniqueadmin-welcome-container">
        <h1 className="uniqueadmin-big-text">
          <span className="uniqueadmin-bounce-fade">C</span>
          <span className="uniqueadmin-bounce-fade">A</span>
          <span className="uniqueadmin-bounce-fade">B</span>
          <span className="uniqueadmin-bounce-fade">I</span>
          <span className="uniqueadmin-bounce-fade">N</span>
          <span className="uniqueadmin-bounce-fade"> </span>
          <span className="uniqueadmin-bounce-fade">F</span>
          <span className="uniqueadmin-bounce-fade">M</span>
        </h1>
        <h2 className="uniqueadmin-medium-text">
          <span className="uniqueadmin-bounce-fade">W</span>
          <span className="uniqueadmin-bounce-fade">e</span>
          <span className="uniqueadmin-bounce-fade">l</span>
          <span className="uniqueadmin-bounce-fade">c</span>
          <span className="uniqueadmin-bounce-fade">o</span>
          <span className="uniqueadmin-bounce-fade">m</span>
          <span className="uniqueadmin-bounce-fade">e</span>
          <span className="uniqueadmin-bounce-fade">s</span>
          <span className="uniqueadmin-bounce-fade"> </span>
          <span className="uniqueadmin-bounce-fade">Y</span>
          <span className="uniqueadmin-bounce-fade">o</span>
          <span className="uniqueadmin-bounce-fade">u</span>
        </h2>
      </div>

      <div className="uniqueadmin-admin-panel mt-10">
        Admin Panel
      </div>

      {/* <div className="uniqueadmin-image-container">
        <img src={AdminImage} alt="Admin" className="uniqueadmin-animated-img" />
      </div> */}
    </div>
  );
};

export default WelcomeAdmin;
