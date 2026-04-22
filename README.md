# 🚀 SWAL VPN - Launch Guide

Your application is now technically ready for full launch. Follow these steps to ensure a smooth rollout.

## 1. 🖼️ Brand Assets (Crucial)
You need to upload your logo file for the app to look professional:
- **File Name**: `logo.png`
- **Location**: `/public/logo.png`
- **Action**: Use the file explorer on the left to upload your eagle/key logo into the `public` folder.

## 2. 🔐 Firebase Production Setup
I have hardened your **Firestore Security Rules**. To finalize:
1. Click the **Firebase** icon in the sidebar.
2. Ensure you see "Firebase is connected".
3. If you want to use your own domain, you can set that up in the [Firebase Console](https://console.firebase.google.com/).

## 3. 📱 Mobile PWA (Play Store Ready)
The app is configured as a **Progressive Web App (PWA)**.
- Users on Android/iOS will see a "Download App" button.
- You can use services like [PWA2APK](https://www.pwa2apk.com/) or [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) to convert this into a real Android App for the Play Store.

## 4. 🌐 Final Deployment
To launch the live version:
1. Click the **Deploy** button in the top right corner.
2. Select **Cloud Run** for a high-performance web link.
3. Or, click the **GitHub** icon to push the latest code to your repository.

## 5. 🛠️ Tech Backend
- **Framework**: React + Vite + Tailwind CSS
- **Database**: Firebase Firestore (Enterprise Tier Ready)
- **Auth**: Google Authentication
- **Security**: Hardened Fortress-level rules (see `firestore.rules`)
- **Responsive**: Full Mobile + Desktop adaptive design

---
*Developed with ❤️ in Google AI Studio Build.*
