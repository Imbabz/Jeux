import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import './index.css';
import { initSession } from './app/session.ts';
import { LocalJsonSource } from './content/index.ts';
import { setupPwa } from './pwa.ts';
import { sound } from './services/index.ts';
import { App } from './ui/App.tsx';

const root = document.getElementById('root');
if (!root) throw new Error('Élément #root introuvable');

setupPwa();
sound.listen();
void initSession(new LocalJsonSource());

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
