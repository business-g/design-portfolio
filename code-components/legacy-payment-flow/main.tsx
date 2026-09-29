import React from 'react';
import { createRoot } from 'react-dom/client';
import { PaymentFlowShot } from './PaymentFlowShot';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <div className="payment-canvas">
    <div className="payment-preview">
      <PaymentFlowShot />
    </div>
  </div>,
);
