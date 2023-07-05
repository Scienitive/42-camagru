import { setListeners } from './listen.js';
import { getCurrentMainView } from './ajax.js';

const currentMainView = await getCurrentMainView();
setListeners(currentMainView);
