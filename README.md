# 📱 Expenso

Expenso is a modern, premium, and feature-rich personal finance tracking mobile application built using **Expo**, **React Native**, **Supabase**, and **Clerk**. Designed with clean aesthetics, smooth micro-animations, glassmorphism elements, and dark mode support, it makes tracking transactions, budgets, goals, and daily streaks engaging and effortless.

---

## 📸 Screenshots & Showcase

<img width="554" height="276" alt="expenso - 29 April 2026 at 21 33 31" src="https://github.com/user-attachments/assets/794fbf88-6f42-4036-8fd2-e08cb8be16ea" />

---

## ✨ Features

- **🔒 Secure Authentication:** Powered by **Clerk Expo** supporting modern, secure authentication flows.
- **☁️ Real-time Cloud Sync:** Powered by **Supabase** for secure, lightning-fast data persistence.
- **📊 Advanced Analytics:**
  - Dynamic spending breakdown with high-fidelity Pie Charts.
  - Interactive monthly Trend Bar Charts.
  - Activity Heatmaps to visualize spending patterns.
- **🎯 Financial Goals:** Create, monitor, and progress towards specific savings and expense goals.
- **🏆 Gamification & Streaks:**
  - Daily login and log streaks to keep you engaged.
  - Unlockable Badges and Achievements based on financial behavior.
  - Interactive Achievement Toast notifications.
- **💡 Smart Budgets:** Setup monthly budgets with intuitive ring-charts and progress bars keeping you under your limits.
- **🎨 Premium UI/UX:** Tailored HSL color systems, glassmorphism cards, micro-animations, and full theme integration.

---

## 🛠️ Tech Stack

* **Framework:** [Expo (v55)](https://expo.dev/) & [React Native](https://reactnative.dev/)
* **Database & Auth:** [Supabase](https://supabase.com/) & [Clerk](https://clerk.com/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Date Parsing:** [date-fns](https://date-fns.org/)
* **Icons & Components:** Expo Icons & SVG support
* **Language:** TypeScript

---

## 📂 Project Structure

```text
expenso_v1/
├── assets/             # Images, fonts, and application static assets
├── src/
│   ├── app/            # Expo Router file-based pages (tabs, screens, modals)
│   ├── components/     # Reusable UI, analytics, budget, and home components
│   ├── constants/      # Core design tokens (theme, colors, typography)
│   ├── hooks/          # Custom React hooks (database, theme, streaks)
│   ├── lib/            # Library setups (Clerk, Supabase, notifications)
│   └── stores/         # Zustand global state stores (gamification, transactions)
├── app.json            # Expo App Configuration
├── eas.json            # EAS Build configurations
├── package.json        # Main dependencies & scripts
└── tsconfig.json       # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v20+ recommended)
* npm (v10+ recommended)
* Expo Go (on iOS/Android device) or Xcode/Android Studio Emulator

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/TamasruPain/Expenso_RN-Expo.git
cd expenso_v1
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and add your keys:

```ini
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Locally

Start the Expo Development Server:

```bash
npx expo start
```

Scan the QR code with your Expo Go app or press **`a`** (for Android) / **`i`** (for iOS) to run on an emulator.

---

## 📦 Building and Publishing

### EAS Update
To publish updates instantly to your users on the `preview` channel:
```bash
eas update --channel preview
```

### EAS Build (Android/iOS)
To create builds for your preview profile:
```bash
eas build --profile preview --platform android
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/TamasruPain/Expenso_RN-Expo/issues).
