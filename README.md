# Insurance Premium Calculator 🛡️

A high-fidelity, professional mobile application for calculating insurance premiums (Marine, Fire, and Motor) with industry-standard precision. Built with a focus on modern aesthetics, including specialized **Graphite Dark Mode** and **Silver Light Mode** themes.

## 📱 Screenshots

<p align="center">
  <img src="screenshot/Screenshot_20260401_211606_Expo Go.jpg" width="30%" alt="Main Screen" />
  <img src="screenshot/Screenshot_20260401_211718_Expo Go.jpg" width="30%" alt="Calculation Details" />
  <img src="screenshot/Screenshot_20260401_211731_Expo Go.jpg" width="30%" alt="Result Summary" />
</p>
<p align="center">
  <img src="screenshot/Screenshot_20260411_213533_Insurence Premium.jpg" width="30%" alt="Main Screen Light Mode" />
  <img src="screenshot/Screenshot_20260411_213626_Insurence Premium.jpg" width="30%" alt="Motor Page" />
  <img src="screenshot/Screenshot_20260411_213615_Insurence Premium.jpg" width="30%" alt="Result Summary Light Mode" />
</p>

## ✨ Key Features

- **Marine Insurance**: Real-time calculation supporting Sea, Air, and Land modes with integrated War & SRCC coverage.
- **Fire Insurance**: Advanced multi-premises layout support with automatic ROI/RSD surcharge logic.
- **Motor Insurance**: Quick premium estimates for private and commercial vehicles.
- **Premium UI/UX**:
  - **Dual Theme System**: Switch between a sleek Graphite/Charcoal dark mode and a premium Silver light mode.
  - **Smart Results**: Result cards dynamically adapt, hiding discount rows when not applicable for a cleaner view.
  - **Micro-animations**: Smooth transitions and interactive elements using React Native Reanimated.
- **Optimization**: Pre-configured industry defaults (ICC C, Shop occupancy, 100% SI) for lightning-fast data entry.

## 🎨 Design Language

The app follows a strict modern design system inspired by premium hardware aesthetics:

- **Dark Mode**: Deep Anthracite (#1C1F22) and Charcoal Graphite (#25292E).
- **Light Mode**: Soft Silver (#F2F4F7) and Pure White.
- **Accent**: International Orange (#F97316) for primary actions and brand emphasis.

---

## 🛠️ Tech Stack

- **Framework**: [Expo SDK 54](https://expo.dev/)
- **Core**: React Native + TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated
- **Icons**: Ionicons (Expo Vector Icons)
- **Data Persistence**: AsyncStorage for custom theme settings

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js/npm
- Expo Go app on your [iOS](https://apps.apple.com/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) device

### Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd insurance-premium
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Start the development server**:

   ```bash
   bun start
   ```

4. **Run on Device**:
   Scan the QR code displayed in your terminal with the Expo Go app.

---

### License

MIT

---

> [!NOTE]
> This app was designed with accessibility and premium visual excellence in mind. Every component is custom-built to ensure a smooth, high-performance experience on both Android and iOS.
