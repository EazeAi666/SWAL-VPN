# 🚀 SWAL VPN - Launch Guide

Your application is now technically ready for full launch. Follow these steps to ensure a smooth rollout.

## 1. 🖼️ Brand Assets (Crucial)
You need to upload your logo file for the app to look professional:
- **File Name**: `logo.png`
- **Location**: `/public/logo.png`
- **Action**: Use the file explorer on the left to upload your eagle/key logo into the `public` folder.

## 2. 🔐 Vercel & Firebase Setup
Since you are moving to Vercel, you must manually add your Firebase configuration to the **Vercel Dashboard** under **Environment Variables**:

1. Go to your project on Vercel.
2. Go to **Settings** > **Environment Variables**.
3. Add the following keys (copy values from your Firebase Project Settings):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_DATABASE_ID` (Optional)

I have hardened your **Firestore Security Rules**. Make sure to deploy them to your Firebase project using the Firebase CLI or the Firebase Console.

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
