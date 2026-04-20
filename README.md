# Koi Pond 🐟

An interactive, deeply relaxing Koi Pond live wallpaper for Wallpaper Engine and Lively Wallpaper. Move your cursor to create ripples, watch the fish scatter, or click to feed them!

[![Steam Subscriptions](https://img.shields.io/steam/subscriptions/3692215641?style=for-the-badge&logo=steam&color=blue)](https://steamcommunity.com/sharedfiles/filedetails/?id=3692215641)

## 🎥 Preview

[![Live Demo Preview](https://i.ibb.co.com/qF0ygzk4/koi-pond-preview.gif)](https://rzrabbi.github.io/koi-pond/)

**🖼️ [Live Demo](https://rzrabbi.github.io/koi-pond/)**

## 🌟 Features

- **Interactive Environment:** Move your cursor to create dynamic ripples.
- **Feed the Koi:** Click to drop food for the fish to seek out.
- **Shy Fish:** Fish naturally scatter and avoid your cursor.
- **Procedural Animation:** Realistic segment-based fish movement.
- **Aesthetic Caustics:** Procedural light patterns synced to the water and fish.
- **Highly Customizable:** Adjust Wallpaper Engine properties:
  - Koi count, speed, and size
  - Water color hue
  - Fish color themes (Traditional, Neon, Monochrome)
  - Toggles for caustics, feeding, and shy fish behavior
  - Ripple strength

## 🚀 How to Use

### Option 1: Steam Workshop (Recommended)

The easiest way to install this wallpaper is directly through the Steam Workshop if you own Wallpaper Engine.

1. Go to the [Steam Workshop Page](https://steamcommunity.com/sharedfiles/filedetails/?id=3692215641).
2. Click the green Subscribe button.
3. Open Wallpaper Engine, and the Koi Pond wallpaper will automatically download and appear in your installed wallpapers list.

---

### Option 2: Wallpaper Engine (Git Method)

Use this option to clone the source code directly into Wallpaper Engine.

1. Open your terminal or command prompt and clone the repository:
   ```bash
   git clone https://github.com/rzrabbi/koi-pond.git
   ```
2. Open Wallpaper Engine.
3. Click Open Wallpaper at the bottom left.
4. Select Open offline wallpaper (animated).
5. Select Create new wallpaper.
6. Navigate to the cloned directory and select the `index.html` file.
7. Customize the settings via the properties panel on the right.

---

### Option 3: Lively Wallpaper (Using .zip Pack - Recommended)

The best free alternative for users who do not own Wallpaper Engine.

1. Go to the [GitHub Releases Page](https://github.com/rzrabbi/koi-pond/releases) and download the latest `.zip` file.
2. Download and install Lively Wallpaper.
3. Open the Lively application and click the Add Wallpaper (+) button at the top.
4. Simply drag and drop the downloaded `.zip` file directly into the Lively window.
5. Follow the on-screen prompts to finish the setup.

---

### Option 4: Lively Wallpaper (Developer / Git Method)

1. Open your terminal or command prompt and clone the repository:
   ```bash
   git clone https://github.com/rzrabbi/koi-pond.git
   ```
2. Open the Lively Wallpaper application and click the Add Wallpaper (+) button at the top.
3. Under the "Select File" section, press Choose a File.
4. Navigate to the cloned directory and select the `index.html` file.
5. Apply it as your background and enjoy!

## 📜 License

This project is open-source. Feel free to use and modify.

---

## 🛠️ Built With

- **Vanilla JavaScript:** Utilizing `CanvasRenderingContext2D` for high-performance visual rendering without heavy dependencies.
- **HTML5 & CSS3:** For structuring and creating an atmospheric vignette effect.
- **Math:** Custom inverse kinematics and physics for fluid ripple equations and Koi swimming.
