import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Benefits from '../components/Benefits';
import CTA from '../components/CTA';

const Home: React.FC = () => {
  return (
    <div className="container main-board">
      <Hero />
      <Features />
      <Benefits />
      <CTA />
    </div>
  );
};

export default Home;
