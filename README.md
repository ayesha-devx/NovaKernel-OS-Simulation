# NovaKernel — Next-Generation Operating System Simulation

NovaKernel is a professional-grade OS kernel simulator featuring real-time visualization, advanced process scheduling, memory management, and hardware abstraction.

## 🚀 Tech Stack

### Frontend
- **React.js + Vite**: Modern, fast UI development.
- **Tailwind CSS**: Utility-first styling with a custom premium dark theme.
- **Framer Motion**: Smooth micro-animations and transitions.
- **Socket.IO Client**: Real-time communication with the kernel engine.
- **React Icons & Toastify**: Rich UI elements and notifications.

### Backend
- **Python Flask**: Robust API and service layer.
- **Flask-SocketIO**: Real-time event handling.
- **Modular OS Core**: Independent modules for process management, scheduling, memory, etc.

## 📁 Project Structure

```text
NovaKernel/
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page views (Dashboard)
│   │   ├── styles/          # Global styles & Tailwind
│   │   └── utils/           # Frontend utilities
│   └── ...
└── backend/                 # Flask Application
    ├── os_modules/          # Core OS logic (Process, Memory, etc.)
    ├── routes/              # REST API Endpoints
    ├── socket_events/       # Real-time event handlers
    ├── utils/               # Backend utilities
    └── app.py               # Entry point
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📋 Features (Foundation)
- [x] Premium Dark Theme UI (#0A0E1A)
- [x] Responsive Dashboard Layout
- [x] Real-time Terminal Component
- [x] Activity Feed System
- [x] Modular Backend Architecture
- [x] Health Check API & Socket.IO base
