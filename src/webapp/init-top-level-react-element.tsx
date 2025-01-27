import { createRoot } from 'react-dom/client';
import { PhaedraApp } from '../components/PhaedraApp';

const domNode = document.getElementById('phaedra-app');
const root = createRoot(domNode);
root.render(<PhaedraApp />);
