# RosCard

**RosCard** is a collection of advanced UI cards designed for seamless integration between **Home Assistant** and the **Astrion ecosystem**.

RosCard enables dynamic, state-aware control interfaces optimized for remotes, wall panels, and touch dashboards.

---

## ✨ Overview

RosCard provides a unified interaction layer between Home Assistant entities and Astrion devices, allowing users to control media, lighting, climate, scenes, and automation workflows through customizable cards.

Unlike traditional dashboards, RosCard is designed around:

- State-driven interaction
- Remote-first UX
- Automation-centric control
- Multi-device synchronization

---

## 🚀 Key Features

- 📺 **TV Control Card**
  - Media player integration
  - Script binding support
  - Directional & long-press controls
  - Multi-device routing

- 🎬 **Media Player Card**
  - Playback control
  - Artwork & metadata display
  - Source switching

- 💡 **Light Control Card**
  - Brightness & color support
  - RGB / Color temperature modes
  - Effect selection

- 🌡 **Climate Control Card**
  - Temperature adjustment
  - HVAC mode control
  - Compatible with most HA climate entities

- 🎛 **Scene & Script Card**
  - Execute Home Assistant scenes
  - Run scripts directly from Astrion Remote
  - Activity-style automation workflows

---

## 🧠 Design Philosophy

RosCard follows a **Home Assistant–native architecture**:

- Home Assistant = Brain
- Astrion Remote = Interface
- RosCard = Interaction Layer

All automation logic remains centralized inside Home Assistant.

This ensures:
- consistent device state
- multi-room synchronization
- automation reliability

---

## 📦 Requirements

- Home Assistant 2024.x or newer (recommended latest)
- Astrion Remote firmware ≥ **1.1.1**
- RosCard ≥ **1.1.1**

---

## 🔧 Installation

### Method 1 — HACS (Recommended)

1. Open **HACS**
2. Navigate to **Frontend**
3. Add Custom Repository
4. Enter repository URL:https://github.com/yyqclhy/RosCard
5. Install RosCard
6. Restart Home Assistant

---

### Method 2 — Manual Installation

1. Copy `/roscard` folder into:

/config/www/

2. Add resource in Dashboard:

/local/roscard/roscard.js

3. Restart Home Assistant

---

## ⚙️ Basic Configuration

Example TV Card:

```yaml
type: custom:ros-tv-card
entity: media_player.living_room_tv
media_player: media_player.shield
power_on:
  service: script.tv_power_on
power_off:
  service: script.tv_power_off

Example Scene & Script Card:

type: custom:ros-scene-card
entity: scene.movie_mode
🎯 Activities (Harmony-style Control)

RosCard supports activity-based workflows using:

Home Assistant scripts
Universal Media Player
Input Select helpers
Automations

Typical example:

Turn on TV
Turn on AVR
Select source
Route volume control
Update remote context

All handled inside Home Assistant.

🔄 Long Press Support

Astrion Remote supports long press on:

Up / Down / Left / Right
Channel + / -
Volume + / -

Users can bind scripts to long presses to implement:

Fast Forward
Rewind
Skip actions
Custom automation triggers
🐞 Known Limitations
...

🤝 Contributing

We welcome contributions!

Ways to contribute:

Bug reports
Feature suggestions
Documentation improvements
Pull requests

Please open an issue before submitting large changes.

🧪 Development

Clone repository:


git clone github.com/yyqclhy/RosCard

❤️ Community
Astrion Forum
Home Assistant Community
GitHub Discussions
📄 License

MIT License

🙏 Acknowledgements

Thanks to the Home Assistant community and all Astrion users contributing feedback and ideas.
