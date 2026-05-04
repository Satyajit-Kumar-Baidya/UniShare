<div align="center">

# 🎓 UniShare

*A modern, real-time, full-stack web application designed for university communities to share, connect, and collaborate.*

<br/>

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

</div>

---

## 📖 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🧪 Testing](#-testing)
- [📦 Production Build](#-production-build)
- [🌐 Deployment](#-deployment)
- [🗂️ Project Structure](#️-project-structure)

---

## ✨ Features

* **💬 Real-Time Integration**: Features live chat, messaging, and push notifications utilizing WebSocket via **Socket.IO**.
* **⚡ Modern React 19 UI**: Extremely fast frontend experience built on **Vite** with strictly-typed **TypeScript** and **React Router DOM**.
* **📱 Responsive Design**: Fast and fully responsive fluid UI modeled with **Tailwind CSS**.
* **📊 Interactive Dashboard**: Track your listings, groups, saved items, and settings effectively.
* **💾 Client-Side State Management**: Managed via built-in hooks and intelligent caching from **TanStack React Query**.

---

## 🛠️ Tech Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router DOM, Zod, Lucide-React |
| **Backend** | Node.js, Express.js, Socket.IO, Better-SQLite3 |
| **Testing** | Vitest, React Testing Library, JSDOM |
| **CI/CD** | Automated GitHub Actions workflows for UI deployments |

---

## 🚀 Getting Started

### Prerequisites

<<<<<<< HEAD
You will need [Node.js](https://nodejs.org/) (v20.19.0 or newer) installed on your local machine.

### Environment Setup

1. Copy the example env files:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```
2. Update `JWT_SECRET` in the root `.env` before using the app outside local development.
3. Keep `VITE_API_URL=http://localhost:8000/api` in `frontend/.env` when running the frontend against the local backend.
=======
You will need [Node.js](https://nodejs.org/) (v18+) installed on your local machine.
>>>>>>> 0be0122be41c58c2752f616568afa17768dae0af

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tanjamul-Azad/UniShare.git
   cd UniShare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   > *Note: This will execute the runner which concurrently spins up the frontend Vite environment and the backend Express/Socket.io node instance.*

4. **Open your browser**
   Navigate to the local URL output in the terminal (usually `http://localhost:5173`).

---

## 🧪 Testing

The repository uses `Vitest` as the testing framework.

* **Run all tests once:**  
  ```bash
  npm run test
  ```
* **Run tests in watch mode:**  
  ```bash
  npm run test:watch
  ```

---

## 📦 Production Build

To compile the project for deployment:

```bash
npm run build
```

This command generates production-ready static assets positioned inside the `frontend/dist` directory.

---

## 🌐 Deployment

The frontend logic is configured to deploy directly to **GitHub Pages**. 

Every push to the `main` branch will seamlessly trigger a Github Action that creates and deploys a static web build.

> **⚠️ Backend Hosting Note:**  
> If you are going to host the live Socket.IO API server for a production audience, you will need to host the backend separately in an environment compatible with running Node.js engines (e.g. Render, Railway, DigitalOcean, Heroku) and update the client-side API target URLs.

---

## 🗂️ Project Structure

```text
📦 UniShare
├── 📂 .github/          # GitHub Actions CI/CD Workflows
├── 📂 backend/          # Node.js Express & Socket.io server
├── 📂 frontend/         # React Application 
│   ├── 📂 src/          # Source Code (Components, Pages, Hooks)
│   ├── 📂 test/         # Setup scripts for Vitest
│   └── 📄 vite.config.ts# Vite builder setup
├── 📂 scripts/          # Workspace maintenance scripts
└── 📄 package.json      # NPM dependencies & workspace scripts
```
