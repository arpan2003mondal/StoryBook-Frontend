import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home: FC = () => {
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate('/users/register');
  };

  const goToLogin = () => {
    navigate('/users/login');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to StoryBook</h1>
        <p className="home-subtitle">Discover amazing stories and share your own</p>
        
        <div className="home-buttons">
          <button className="btn btn-primary" onClick={goToRegister}>
            Create Account
          </button>
          <button className="btn btn-secondary" onClick={goToLogin}>
            Sign In
          </button>
        </div>

        {/* <div className="home-features">
          <div className="feature">
            <h3>📖 Read Stories</h3>
            <p>Browse through a collection of amazing stories</p>
          </div>
          <div className="feature">
            <h3>✍️ Write Stories</h3>
            <p>Share your creativity with the world</p>
          </div>
          <div className="feature">
            <h3>👥 Connect</h3>
            <p>Join a community of storytellers</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
