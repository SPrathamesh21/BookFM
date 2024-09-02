import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import './SideNav.css'; // Import the CSS file

// eslint-disable-next-line react/prop-types
const AnimatedIcon = ({ icon, label, to }) => {
  const [hover, setHover] = React.useState(false);

  const style = {
    transition: 'transform 0.3s ease',
    transform: hover ? 'scale(1.2)' : 'scale(1)',
  };

  return (
    <li className="mb-2">
      <Link
        to={to}
        className="flex items-center p-2 rounded-md"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <FontAwesomeIcon icon={icon} style={style} className="mr-2 icon" />
        {label}
      </Link>
    </li>
  );
};

const SideNav = () => {
  return (
    <nav className="side-nav-container text-lg bg-sky-900 text-white p-3 h-screen side-nav">
    <div className="w-side mt-10 text-xl">
      <ul className="mt-10">
        <AnimatedIcon icon={faHome} label="Home Admin" to="/admin_panel" />
        <hr />
  
        <AnimatedIcon icon={faPlus} label="Add E-Book" to="/admin_panel/AddEBook" />
        <hr />

      </ul>
    </div>
  </nav>
  
  );
};

export default SideNav;
