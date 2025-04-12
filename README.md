<p align="center">
  <a href="https://ripple-link.vercel.app/" target="blank"><img src="https://raw.githubusercontent.com/EduardStroescu/PubImages/main/WebsiteImages/rippleLink.jpg" alt="RippleLink Preview" /></a>
</p>

# RippleLink FrontEnd

### Link to the Live Demo: https://ripple-link.vercel.app

### Links to the Backend:

https://github.com/EduardStroescu/RippleLink-Backend - Backend GIT Repository<br>
https://ripple-link.koyeb.app - Backend Home Page<br>
https://ripple-link.koyeb.app/api/docs - Backend API Documentation made with Swagger

# Introduction

Full-Stack live calls and messaging service using SocketIO, WebRTC and NestJS with MongoDB.

## Description

Used Tanstack Router in combination with Tanstack Query in order to preload and manage the content required for all routes. Real-time data comes through web sockets with SocketIO, and calls are made through a WebRTC mesh pattern with simple-peer(please check the notes from the bottom of the page regarding WebRTC). Any media uploaded by the users is sent to Cloudinary where it gets optimized and linked to the users stored on the backend.

In order not to keep asking the user to log in for every visit I've used the browser's local storage to keep track of the user's last session state (JWT), which is then managed by Zustand. I know local storage is not the best option, but for the moment it suits my needs.

## Technologies Used

- Vite-React-SWC
- [socket.io](https://socket.io/)
- [simple-peer](https://github.com/feross/simple-peer) - WebRTC Calls
- [shadcn/ui](https://github.com/shadcn/ui) - UI Components
- [zustand](https://github.com/pmndrs/zustand) - State Management
- [mutative](https://github.com/unadlib/mutative) - Immutable updates similar to Immer
- [axios](https://github.com/axios/axios) - HTTP Requests
- [tanstack/virtual](https://github.com/TanStack/virtual) - Virtual List
- [tanstack/react-router](https://github.com/TanStack/router) - Routing
- [tanstack/react-query](https://github.com/TanStack/query) - Data Fetching
- [zod](https://github.com/colinhacks/zod) - Data Validation
- [react-hook-form](https://github.com/react-hook-form/react-hook-form) - Form Validation
- [Tailwind](https://tailwindcss.com/) - CSS Framework
- [gif-picker-react](https://github.com/MrBartusek/gif-picker-react) - GIF Picker
- [emoji-picker-react](https://github.com/ealush/emoji-picker-react) - Emoji Picker
- [react-colorful](https://github.com/omgovich/react-colorful) - Color Picker
- Typescript

```
Remember to update `.env`! You also need to provide the url to the frontend and backend.

Example:

VITE_BACKEND_URL="" - The running backend url. For Dev: "http://localhost:3000/".
VITE_TENOR_KEY="" - Key provided by Tenor API, Managed from the Google Cloud console.
VITE_FRONTEND_URL="http://localhost:5173" for local dev - The url of where the frontend is hosted.
VITE_BACKEND_URL="" - The url of where the backend is hosted. The port can be chosen through the backend's .env

VITE_DEMO_ACC_ONE_EMAIL="" - Credentials of the first account created for demo purposes.
VITE_DEMO_ACC_ONE_PASSWORD="" - Credentials of the first account created for demo purposes.
VITE_DEMO_ACC_TWO_EMAIL="" - Credentials of the second account created for demo purposes.
VITE_DEMO_ACC_TWO_PASSWORD="" - Credentials of the second account created for demo purposes.
VITE_DEMO_ACC_THREE_EMAIL="" - Credentials of the third account created for demo purposes.
VITE_DEMO_ACC_THREE_PASSWORD="" - Credentials of the third account created for demo purposes.

```

### Installation && Local Development

```bash
git clone https://github.com/EduardStroescu/RippleLink-Frontend.git
npm install
npm run dev
```

### To prepare for production/minify

```bash
npm run build
```

### Notes:

For both individual and group calls, I've implemented a Mesh Pattern WebRTC connection using simple-peer. This setup allows multiple users to join the same call, but it becomes less scalable as the number of peers increases. In a mesh network, each peer must establish a connection with every other peer, resulting in a total of 𝑛(𝑛−1)/2 connections, where 𝑛 is the number of peers.

To address this scalability issue, a more efficient approach would be to implement an SFU (Selective Forwarding Unit) pattern. In this model, a backend server acts as a media relay, with clients sending their video and audio streams to the server. The server then forwards these streams to the other clients, reducing the number of connections each peer needs to manage.

For my purposes the current implementation is sufficient. I'll consider implementing the SFU pattern in the future. If you want to look into it check out [MediaSoup](https://mediasoup.org/).
