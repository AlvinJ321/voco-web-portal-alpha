import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ParaformerPoc from './components/ParaformerPoc.tsx';
import './index.css';

const path = window.location.pathname;
const RootComponent = path === '/paraformer-poc' ? ParaformerPoc : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>
);
