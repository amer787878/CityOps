/* src/utils/socket.ts */
import { io, Socket } from 'socket.io-client';

/**
 *  One single client that every React component imports.
 *  Because we call `io()` **without a URL**, Socket.IO uses the
 *  current page’s origin – so it is automatically:
 *    • https://CityOps.cs.colman.ac.il/socket.io/   in prod
 *    • http://localhost:3000/socket.io/               in dev (create-react-app)
 *
 *  All requests therefore stay on HTTPS and the browser won’t block them.
 */
export const socket: Socket = io({
  path: '/socket.io',                 // keep the default path explicit
  transports: ['websocket', 'polling'], // websocket first, xhr-polling fallback
  withCredentials: true               // forward cookies / auth headers
  /* DO NOT add  secure:true here – it is implied when the page is https */
});
