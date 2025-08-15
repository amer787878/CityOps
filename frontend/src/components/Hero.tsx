import React from 'react';
import bannerImg from '../assets/images/banner.png';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
    return (
        <div className="hero">
            <div className="hero-content">
                <h1>Welcome to CityOps</h1>
                <p>
                    Modernizing urban issue reporting with AI. Empower citizens, engage communities, and improve your city effortlessly.
                </p>
                <div className='my-3'>
                    <Link to="/register" className="btn-primary">Get Started</Link>
                </div>
            </div>
            <div className="hero-image">
                <img src={bannerImg} alt="CityOps Banner" />
            </div>
        </div>
    );
};

export default Hero;
