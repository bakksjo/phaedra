import { createRoot } from 'react-dom/client';
import { PhaedraApp } from '../components/PhaedraApp';

const domEntryPointId = 'phaedra-app';

const domNode = document.getElementById(domEntryPointId);
if (!domNode) {
  throw new Error(`Could not find DOM node with id "${domEntryPointId}"`);
}
const root = createRoot(domNode);
root.render(<PhaedraApp />);
