import { createRoot } from 'react-dom/client';
import { PhaedraApp } from '../components/PhaedraApp/PhaedraApp';

const DOM_ENTRY_POINT_ID = 'phaedra-app';

export const initTopLevelReactElement = (username: string, serviceBaseUrl: string | undefined) => {
  const domNode = document.getElementById(DOM_ENTRY_POINT_ID);
  if (!domNode) {
    throw new Error(`Could not find DOM node with id "${DOM_ENTRY_POINT_ID}; check the index.html file"`);
  }
  const root = createRoot(domNode);
  root.render(<PhaedraApp initialUsername={username} serviceBaseUrl={serviceBaseUrl} />);
}
