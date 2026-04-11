# SWAL VPN - Monetized & High-Performance VPN Solution

**Created by: Adesina-Isreal-EAZE-AI**

SWAL VPN is a production-ready, monetized VPN application built with React, Tailwind CSS, and Firebase. It features a tiered subscription model, an administrative control panel for key management, and optimized "Turbo" servers for streaming and gaming.

## 🚀 Key Features

### 💰 Monetization Model
- **Free-to-Use**: No access keys or subscriptions required. Users can sign in with Google and start using the VPN immediately.
- **Ad-Supported**: The application features integrated advertisement slots to generate revenue while keeping the service free for users.

### 🛡️ Security & Performance
- **Global Server Network**: High-speed servers in **Los Angeles**, **Miami**, **Toronto**, **Vancouver**, London, Frankfurt, Tokyo, and Paris.
- **Turbo Mode**: Specialized routing for optimized streaming and gaming performance, now available to all users.
- **Kill Switch**: Prevents data leaks if the VPN connection drops.
- **Multiple Protocols**: Support for WireGuard (Recommended), OpenVPN, and IKEv2.
- **Real-time Monitoring**: Live speed charts and connection logs.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4
- **UI Components**: shadcn/ui, Lucide React
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts
- **Backend**: Firebase (Firestore, Authentication)

## ⚙️ Setup & Configuration

1. **Environment Variables**:
   - Create a `.env` file based on `.env.example`.
   - `GEMINI_API_KEY`: Required for AI-enhanced features.

2. **Firebase Setup**:
   - Configure a Firebase project with Firestore and Authentication (Google & Email/Password).
   - Update `firebase-applet-config.json` with your project credentials.
   - Deploy the provided `firestore.rules` to your Firebase project.

3. **Admin Setup**:
   - The default administrator is set to `isrealadesina3@gmail.com`.
   - To change or add admins, update the logic in `src/components/AuthScreen.tsx` and `firestore.rules`.

## 📦 Installation

```bash
npm install
npm run dev
```

---
*This project was developed with a focus on high-performance networking and commercial scalability.*
