import React from 'react';
import aiPoweredImg from '../assets/images/ai-powered.png';
import multimediaImg from '../assets/images/multimedia.png';
import realTrackImg from '../assets/images/realTrack.png';

const Features: React.FC = () => {
  const features = [
    {
      img: aiPoweredImg,
      title: 'AI-Powered Issue Analysis',
      description: 'Leverage advanced AI tools to classify, prioritize, and assign issues seamlessly.',
    },
    {
      img: multimediaImg,
      title: 'Multimedia Reporting',
      description: 'Report urban issues using text, photos, or voice for enhanced clarity.',
    },
    {
      img: realTrackImg,
      title: 'Real-Time Tracking',
      description: 'Stay updated on issue progress with a real-time tracking dashboard.',
    },
  ];

  return (
    <div className="features">
      <h2>Why CityOps?</h2>
      <div className="features-list mt-5">
        {features.map((feature, index) => (
          <div className="feature-item" key={index}>
            <img src={feature.img} alt={feature.title} />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
