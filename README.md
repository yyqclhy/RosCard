# RosCard

**RosCard** is an open-source interface layer for the **Sanytron Astrion Remote** and **Home Assistant**.

It provides dynamic, state-aware UI cards designed for remote-first smart home control, media management, automation, and activity-style workflows.

> **Part of the Sanytron / Qinkunex ecosystem.**

---

<div align="center">

[![GitHub release](https://img.shields.io/github/release/yyqclhy/RosCard.svg)](https://github.com/yyqclhy/RosCard/releases)
[![GitHub license](https://img.shields.io/github/license/yyqclhy/RosCard)](LICENSE)
[![HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=yyqclhy&repository=RosCard&category=integration)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-Yes-green.svg)](https://github.com/yyqclhy/RosCard/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/yyqclhy/RosCard)](https://github.com/yyqclhy/RosCard/issues)
[![GitHub stars](https://img.shields.io/github/stars/yyqclhy/RosCard)](https://github.com/yyqclhy/RosCard/stargazers)

</div>

---

## 🌐 Ecosystem

RosCard / Astrion Integration is developed as part of the broader Sanytron interface ecosystem.

- 🌐 **Sanytron Official Website** — Product overview, news, and ecosystem hub
- 🌐 **Sanytron Hub** — Documentation, downloads, firmware, support, and product information
- 💬 **Sanytron Forum** — Technical discussions, feature requests, troubleshooting, and community development
- 🧠 **Qinkunex** — Human–Object Interaction & Interface Engineering

### Official Links

- [Sanytron Official Website](https://www.sanytron.com/)
- [Sanytron Hub](https://hub.sanytron.com/)
- [Sanytron Forum](https://forum.sanytron.com/)
- [Qinkunex Profile](https://github.com/Qinkunex)
- [r/Sanytron](https://www.reddit.com/r/Sanytron/)
- [Sanytron Discord](https://discord.gg/dh2sQrWTH)

---

## ✨ Overview

RosCard provides a unified interaction layer between **Home Assistant entities** and the **Astrion Remote**.

It allows users to build dedicated interfaces for:

- Smart TVs
- Media players
- AV receivers
- Lighting
- Climate control
- Scenes
- Scripts
- Automations
- Activity-style workflows
- Multi-device control

Unlike conventional Home Assistant dashboards, RosCard is designed around a **remote-first interaction model**. The goal is to make complex Home Assistant systems easier to operate through a dedicated physical interface.

### Core Principles

- **State-driven interaction** — Cards respond to real-time entity states
- **Remote-first UX** — Optimized for physical remote control, not touchscreens
- **Automation-centric** — Designed to trigger and manage automations seamlessly
- **Home Assistant-native** — Leverages HA entities, services, and events
- **Local-first operation** — No cloud dependency for core functionality
- **Multi-device synchronization** — Consistent state across all interfaces
- **Customizable interfaces** — Adaptable to individual user needs

---

## 🧠 Architecture

RosCard follows a simple, layered architecture:

```text
┌─────────────────────────────┐
│       Home Assistant        │
│                             │
│  Devices · States · Scripts │
│  Automations · Scenes       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│           RosCard           │
│                             │
│     Interaction Layer       │
│  UI · Actions · Context     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Astrion Remote        │
│                             │
│  Touchscreen · Buttons      │
│  Hardware Controls          │
└─────────────────────────────┘
```

### Design Philosophy

- **Home Assistant** = Brain  
  Responsible for device state, automation logic, scenes, scripts, and integrations.

- **RosCard** = Interaction Layer  
  Provides the interaction model and context-aware UI.

- **Astrion** = Interface  
  Delivers the dedicated physical control surface.

This separation keeps automation logic centralized in Home Assistant while allowing the user interface to remain highly customizable and independent.

---

## 🚀 Features

### 📺 TV Control Card

The TV card provides advanced control for media devices and home theater workflows.

**Features include:**
- Media player integration
- Power control (on/off)
- Source selection
- Directional controls (up/down/left/right)
- OK / Enter actions
- Long-press support
- Script binding
- Multi-device routing
- Customizable UI elements
- Device name and icon display

### 🎬 Media Player Card

Designed for media players such as:

- Apple TV
- Android TV
- Kodi
- CoreELEC
- Google TV
- Other Home Assistant-compatible media players

**Features include:**
- Playback control (play/pause/next/previous)
- Artwork display
- Metadata (title, artist, album)
- Source selection
- Volume control
- Navigation
- Custom actions

### 💡 Light Control Card

Control Home Assistant lighting entities through a dedicated interface.

**Supports:**
- On/Off
- Brightness adjustment
- RGB color
- Color temperature
- Effects
- Custom actions

### 🌡️ Climate Control Card

Control compatible Home Assistant climate entities.

**Supports:**
- Target temperature
- Current temperature
- HVAC modes (heat/cool/auto/etc.)
- Fan modes
- Presets
- Basic climate actions

### 🎛️ Scene & Script Card

RosCard can directly expose Home Assistant scenes and scripts through dedicated interface elements.

This allows users to build workflows such as:

- Movie Night
- Good Morning
- Good Night
- Leaving Home
- Gaming Mode
- Music Mode
- Home Theater
- Custom automation sequences

### 🎯 Activity-style Workflows

RosCard can be used to build Harmony-style activity workflows through Home Assistant.

Rather than implementing a separate automation engine, RosCard uses Home Assistant as the underlying logic layer.

**Example: A Movie Night workflow could:**

1. Turn on the TV
2. Turn on the AV receiver
3. Select the correct HDMI input
4. Start the media player
5. Configure volume routing
6. Trigger Home Assistant scripts or automations
7. Present the appropriate control interface on Astrion

**Example architecture:**

```
             Movie Night
                  │
                  ▼
        Home Assistant Script
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
      TV         AVR       Apple TV
       │          │          │
       └──────────┼──────────┘
                  ▼
              RosCard
                  │
                  ▼
             Astrion UI
```

This approach allows users to create sophisticated activity-style systems while keeping the actual device logic inside Home Assistant.

- For **network-connected devices**, Home Assistant can use actual entity state.
- For **IR-only devices**, users can implement workflows through scripts and automations.

### 🔄 Long Press Support

Astrion Remote supports long-press actions for physical controls.

Depending on configuration, users can bind long presses to:

- Up / Down / Left / Right
- Channel + / -
- Volume + / -
- Other supported hardware buttons

**Examples:**

| Action | Result |
|--------|--------|
| Long Press Up | Fast Forward |
| Long Press Down | Rewind |
| Long Press Volume+ | Custom Automation |

Long-press actions can be connected to Home Assistant scripts, services, or other automation workflows.

### 🏠 Home Assistant Integration

RosCard is designed to work **with** Home Assistant rather than replacing it.

Existing Home Assistant integrations remain the foundation of the system.

RosCard can interact with:

- `media_player`
- `light`
- `climate`
- `scene`
- `script`
- `input_select`
- Automations
- Other Home Assistant entities and services

This makes RosCard particularly useful for users who already have an established Home Assistant installation.

---

## 📦 Requirements

**Recommended:**
- Home Assistant 2024.x or newer
- Latest stable Home Assistant version
- Astrion Remote
- Astrion firmware V1.4.1 or newer
- Latest RosCard release

> **Note:** Features may depend on the installed Astrion firmware and RosCard version. For the latest firmware and documentation, see the [Sanytron Hub](https://hub.sanytron.com/).

---

## 🔧 Installation

### Method 1 — HACS (Recommended)

1. Open HACS
2. Navigate to **Frontend**
3. Select **Custom repositories**
4. Add: `https://github.com/yyqclhy/RosCard`
5. Select **Lovelace** as the repository category
6. Install RosCard
7. Restart Home Assistant if required
8. Add the desired RosCard resources/cards to your dashboard

> **Note:** If RosCard becomes available directly through the HACS default repository in the future, the custom repository step will no longer be necessary.

### Method 2 — Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yyqclhy/RosCard.git
   ```
2. Copy the required RosCard files into `/config/www/`
3. Add the resource to your Home Assistant dashboard:
   ```
   /local/roscard/roscard.js
   ```
4. Restart Home Assistant and add the desired RosCard cards to your dashboard.

---

## ⚙️ Configuration

### Example TV Card

```yaml
type: custom:ros-tv-card
entity: media_player.living_room_tv
media_player: media_player.shield
keypad_brightness: 50
power_on:
  service: script.tv_power_on
power_off:
  service: script.tv_power_off
```

### Example Scene & Script Card

```yaml
type: custom:ros-scene-card
entity: scene.movie_mode
```

> **Note:** The exact configuration options may vary depending on the current RosCard release. See the documentation and examples for the latest configuration syntax.

---

## 🎨 Remote-first UX

RosCard is designed specifically with dedicated control interfaces in mind.

A conventional Home Assistant dashboard often contains a large amount of information designed for a phone, tablet, or desktop.

A remote is different. It needs:

- ✅ Fast access
- ✅ Clear state
- ✅ Large controls
- ✅ Minimal navigation
- ✅ Predictable actions
- ✅ Physical button integration
- ✅ Context-aware interfaces

RosCard therefore focuses on creating **purpose-built interfaces** rather than simply shrinking a traditional dashboard onto a remote.

---

## 🧩 Astrion Ecosystem

RosCard is one component of the broader Astrion ecosystem.

```
Home Assistant
      │
      ├── Integrations
      ├── Devices
      ├── Scripts
      ├── Automations
      └── Scenes
              │
              ▼
           RosCard
              │
              ▼
        Astrion Remote
```

- **Astrion** provides the physical interface.
- **RosCard** provides the interaction layer.
- **Home Assistant** provides the underlying intelligence and automation system.

---

## 🐞 Known Limitations

RosCard is actively developed and some advanced UI behaviors are still evolving.

Current limitations and planned improvements are tracked through:
- [GitHub Issues](https://github.com/yyqclhy/RosCard/issues)
- GitHub Pull Requests
- [Sanytron Forum](https://forum.sanytron.com/)
- Astrion community discussions

**If you encounter unexpected behavior, please open an issue with:**
- Home Assistant version
- Astrion firmware version
- RosCard version
- Relevant YAML configuration
- Screenshots or recordings
- Steps to reproduce the problem

> ⚠️ **Please avoid posting sensitive Home Assistant information** such as credentials, tokens, or private network details.

---

## 🛣️ Development & Roadmap

RosCard is developed together with the Astrion community.

Feature priorities are influenced by:
- User feedback
- GitHub issues
- Community discussions
- Astrion Forum requests
- Real-world usage
- Hardware and firmware development

Astrion development follows a community-driven approach where hardware, firmware, software, and interface design continue to evolve based on actual user requirements.

For broader Astrion development plans and milestones, see the **Astrion 2026 Version Evolution Plan & Milestone Roadmap**.

---

## 🤝 Contributing

Contributions are welcome!

You can contribute through:

- 🐞 Bug reports
- 💡 Feature requests
- 📖 Documentation improvements
- 🧪 Testing
- 🔧 Pull requests
- 🎨 UI / UX improvements
- 🏠 Home Assistant integration ideas

**For larger changes**, please open an issue or discussion before submitting a major pull request.

We especially welcome contributions from Home Assistant users who want to experiment with new interaction models for dedicated smart home interfaces.

### 🧪 Development

Clone the repository:
```bash
git clone https://github.com/yyqclhy/RosCard.git
cd RosCard
```

The project structure and architecture documentation can be found in the `docs/` directory.

---

## 📚 Documentation

Additional documentation is available through the Sanytron ecosystem.

### Sanytron Hub
Official product documentation, downloads, firmware updates, tutorials, and support:
[https://hub.sanytron.com/](https://hub.sanytron.com/)

### Sanytron Forum
Technical discussions, troubleshooting, feature requests, and community knowledge:
[https://forum.sanytron.com/](https://forum.sanytron.com/)

### Reddit
Join the Astrion and Sanytron community:
[https://www.reddit.com/r/Sanytron/](https://www.reddit.com/r/Sanytron/)

### Discord
Join the Sanytron community and development discussions:
[https://discord.gg/dh2sQrWTH](https://discord.gg/dh2sQrWTH)

---

## ❤️ Community

RosCard is built together with the Astrion and Home Assistant community.

We believe dedicated interfaces should evolve from real-world use rather than being designed entirely in isolation.

Feedback from users directly influences:
- UI design
- Hardware controls
- Firmware features
- Software architecture
- Documentation
- Development priorities

**If you are using RosCard with Astrion, we'd love to see your setup.**  
Share your configuration, ideas, improvements, or feedback with the community.

---

## 🔗 Related Projects

### Astrion Integration
Home Assistant integration for Astrion Remote:
[https://github.com/yyqclhy/Astrion-integration](https://github.com/yyqclhy/Astrion-integration)

### UltraWorkspace
Desktop configuration and control software for Sanytron UltraBarX:
[https://github.com/Qinkunex/UltraWorkspace](https://github.com/Qinkunex/UltraWorkspace)

---

## 👥 Contributors

RosCard is maintained by the Sanytron development team and community contributors.

Special thanks to everyone who reports issues, tests releases, contributes code, and shares ideas.

**Current contributors include:**
- yyqclhy
- cominew

---

## 📄 License

RosCard is released under the **MIT License**.  
See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

RosCard would not exist without the work of the Home Assistant community and the users who continue to experiment with new ways of interacting with smart homes.

Thank you to everyone contributing feedback, testing new releases, reporting bugs, and helping shape the Astrion ecosystem.

---

<p align="center">
  <strong>RosCard</strong><br>
  Home Assistant × Astrion<br>
  <em>Part of the Sanytron / Qinkunex ecosystem.</em>
</p>
