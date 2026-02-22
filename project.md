# GreenCity - Smart Urban Eco-Platform

GreenCity is a high-fidelity urban eco-system monitoring and management platform designed to empower citizens and municipal authorities in building a sustainable city. It provides real-time intel on civic issues, transport logistics, and personal impact tracking through a premium, glassmorphic interface.

## 🚀 Key Features

### 1. Unified Intelligence Dashboard (Mission Control)
- **Live Intel Stream**: Real-time updates on city-wide activity and civic incidents.
- **Primary Intel**: High-level overview of personal impact, resolved nodes, and global standing.
- **Dynamic Modular Navigation**: Seamless switching between Overview, Deployments, City Pulse, and Eco-Logistics.

### 2. Civic Issue Reporting & Lifecycle
- **Rapid Deployment**: Report hazards, waste, or infrastructure damage in under two minutes.
- **Evidence-Based Reporting**: Support for high-resolution image uploads for incident verification.
- **Resolution Tracking**: Monitor the "Structural Integrity" of reported nodes as municipal authorities resolve issues.
- **Personal Archive**: Comprehensive history of all reported and resolved deployments.

### 3. Eco-Transport & Logistics Grid
- **Transport Telemetry**: Real-time monitoring of low-emission corridors and eco-transport options.
- **Route Analytics**: Detailed information on routes (From/To), frequency, and fare structures.
- **Logistics Grid**: Visualization of the city's sustainable transport efficiency.

### 4. Impact Quotient & Gamification
- **Impact Quotient (Points)**: Earn points for active participation and issue resolution.
- **Infrastructure Tiers**: Climb reputation tiers based on your contribution to the city's well-being.
- **Global Standing**: Real-time leaderboard comparing impact metrics across the citizen network.

### 5. Secure Authentication & Identity
- **Multi-Cloud Sync**: Support for OAuth and JWT-based authentication.
- **Profile Management**: Personalized eco-profiles with impact tracking and rank history.

---

## 🛠 Technology Stack

### Frontend (High-Fidelity Interface)
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (using the latest `@theme` engine)
- **Animations**: Framer Motion for smooth transitions and micro-animations
- **Aesthetics**: Custom Glassmorphism and Mesh Gradients for a premium "Cyber-Eco" feel
- **State Management**: React Context API for Global Auth and Theme

### Backend (Infrastructure Layer)
- **Runtime**: Node.js & Express
- **Database**: MongoDB with Mongoose ODM
- **Security**: Passport.js (JWT & OAuth strategies)
- **File Systems**: Multer for secure evidence storage (image uploads)

---

## 📁 Project Structure

- `frontend/`: React application with modular feature-based architecture.
- `backend/`: Express server with dedicated routes for Issues, Transport, and Rankings.
- `uploads/`: Secured storage for incident verification evidence.

---

## 🏗 Installation & Setup

1. **Frontend**:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

2. **Backend**:
   ```bash
   cd backend
   npm install
   npm run start
   ```

*GreenCity - Reclaiming the urban landscape, one node at a time.*
