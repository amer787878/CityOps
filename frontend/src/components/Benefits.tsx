import React from 'react';
import engageImg from '../assets/images/engage.png';

const Benefits: React.FC = () => {
  return (
    <div className="benefits">
      <h2>Engage with the Community</h2>
      <div className="benefits-content">
        <img src={engageImg} alt="Community Engagement" />
        <div>
          <p>
            CityOps not only connects citizens with municipal authorities but fosters a sense of community. Share updates, encourage participation, and celebrate resolved issues together.
          </p>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default Benefits;
