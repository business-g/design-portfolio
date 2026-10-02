import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: { rollupOptions: { input: {
    portfolio: resolve(import.meta.dirname, 'index.html'),
    caseDashboard: resolve(import.meta.dirname, 'cellframe-dashboard/index.html'),
    caseSurf2: resolve(import.meta.dirname, 'surf-2/index.html'),
    caseWallet: resolve(import.meta.dirname, 'cellframe-wallet/index.html'),
    legacyVpn: resolve(import.meta.dirname, 'code-components/legacy-vpn-prototype/index.html'),
    legacyPayment: resolve(import.meta.dirname, 'code-components/legacy-payment-flow/index.html'),
    agentCard: resolve(import.meta.dirname, 'code-components/agent-card-clickable-prototype/index.html'),
    slider: resolve(import.meta.dirname, 'code-components/base-slider-prototype/index.html'),
    supportVolume: resolve(import.meta.dirname, 'code-components/support-volume-figma-prototype/index.html'),
    prototype: resolve(import.meta.dirname, 'code-components/base-clickable-prototype/index.html'),
    reportingBacklog: resolve(import.meta.dirname, 'code-components/reporting-backlog-dnd-prototype/index.html'),
  } } },
});
