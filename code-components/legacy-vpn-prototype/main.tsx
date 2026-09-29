import React from 'react';
import { createRoot } from 'react-dom/client';
import { VpnPreviewShot } from './VpnPreviewShot';
import './styles.css';
createRoot(document.getElementById('root')!).render(
  <div className="vpn-canvas"><div className="vpn-preview"><VpnPreviewShot /></div></div>
);
