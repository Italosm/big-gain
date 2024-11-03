/* eslint-disable no-console */
import { env } from '../env-config/env';
import { app } from './app';
import { initializeBot } from './routes/telegram.routes';

const port = env.PORT;
initializeBot();
const server = app.listen(port, () => {
  console.log(`Server started on port ${port} 💻🖥`);
});
