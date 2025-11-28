# RosCard

专为 **AIKS X9 Vela Edition** 遥控器设计的Home Assistant自定义Lovelace卡片。

![AIKS X9 Vela Edition](https://img.shields.io/badge/AIKS-X9%20Vela%20Edition-orange) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Custom%20Card-blue) ![Version](https://img.shields.io/github/release/yyqclhy/RosCard?style=flat&logo=github&label=Version) ![Downloads](https://img.shields.io/github/downloads/yyqclhy/RosCard/total?logo=github) ![License](https://img.shields.io/github/license/yyqclhy/RosCard)

## 🖼️ 卡片预览

### 📺 设备图标展示
以下是RosCard支持的主要设备类型图标：

| 设备类型 | 图标预览 | 设备类型 | 图标预览 |
|---------|---------|---------|---------|
| 电视/媒体 | ![TV Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_tv.png) | 空调温控 | ![Climate Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_climate.png) |
| 智能灯光 | ![Light Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_light.png) | 智能开关 | ![Switch Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_switch.png) |
| 场景控制 | ![Scene Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_scene.png) | 风扇设备 | ![Fan Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_fan.png) |
| 窗帘控制 | ![Cover Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_cover.png) | 统计数据 | ![Statistics Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_statistics.png) |
| 主机设备 | ![Host Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_host.png) | 天气信息 | ![Weather Icon](https://raw.githubusercontent.com/yyqclhy/RosCard/main/dist/icon_img/icon_weather.png) |

### 🎮 AIKS X9 Vela 专用界面
- **遥控器优化**：界面专为AIKS X9 Vela遥控器的操作习惯设计
- **直观导航**：使用方向键轻松浏览各种设备控制选项
- **快速响应**：确认键即时执行操作，状态实时反馈


## 🎯 功能特性

专为AIKS X9 Vela Edition遥控器设计的Home Assistant控制界面：

- 🎮 **AIKS X9 Vela 专属优化**：界面设计和操作逻辑专为遥控器优化
- 📺 **媒体播放控制**：支持播放/暂停、音量调节、静音功能
- 🌡️ **空调温控**：温度设定、模式切换、风速调节
- 💡 **智能照明**：灯光开关、亮度控制、色温调节
- 🔌 **智能开关**：插座、墙壁开关的状态控制
- 🎬 **场景管理**：一键触发和切换预设场景
- 🌊 **风扇设备**：速度调节、开关控制、模式选择
- 🪟 **窗帘控制**：窗帘开关、位置调节、停止控制
- 🔒 **门锁管理**：智能门锁的上锁/解锁状态监控
- 📹 **监控查看**：摄像头实时查看和录制控制
- 🌡️ **传感监测**：各类传感器数值显示和状态监控
- 🌤️ **天气信息**：温湿度显示和天气预报
- 🎮 **红外遥控**：支持自定义按键发送和命令学习
- 📊 **统计展示**：设备能耗、使用时长等数据统计
- 🖥️ **主机监控**：服务器、NAS等主机设备状态监控
- 🎨 **专用图标**：每种设备类型都有专门设计的图标
- 📱 **统一界面**：所有设备使用统一的遥控器操作逻辑
- ⚡ **实时更新**：设备状态变化实时反映在界面上

## 📱 支持的设备类型

根据代码分析，RosCard实际支持的设备类型包括：

### 🌡️ 温控设备
- `climate` - 空调、温控器（温度调节、模式切换、风速控制）

### 📺 媒体设备
- `media_player` - 电视、音响、播放器（播放/暂停、音量控制、静音切换）
- `tv` - 电视专用（Power、方向键、菜单、返回等电视遥控功能）

### 💡 照明设备
- `light` - 智能灯具（开关控制、亮度调节、色温控制）

### 🔌 电源设备
- `switch` - 智能插座、墙壁开关（开关控制、状态显示）

### 🎬 场景设备
- `scene` - 智能场景（一键触发预设场景）

### 🌊 风扇设备
- `fan` - 风扇设备（速度调节、开关控制）

### 🪟 窗帘设备
- `cover` - 窗帘、遮阳帘（开关控制、位置调节）

### 🚪 门锁设备
- `lock` - 智能门锁（上锁/解锁、状态监控）

### 📹 摄像头设备
- `camera` - 监控摄像头（查看监控、录制控制）

### 🌡️ 传感器设备
- `sensor` - 各类传感器（数值显示、状态监控）
- `weather` - 天气信息（温湿度、天气预报）

### 🎮 遥控器设备
- `remote` - 红外遥控器（按键发送、命令学习）
- `statistics` - 统计数据（能耗、使用时长等统计信息）

### 🏠 主机设备
- `host` - 主机设备（进行中）

### 📊 实时监测
- **专用图标支持**：每个设备类型都有专门的图标文件
- **状态实时更新**：设备状态变化实时显示
- **统一操作界面**：所有设备使用统一的遥控器操作逻辑

## 📋 安装方法

### 🚀 一键安装到HACS（推荐）

点击下方按钮直接安装到Home Assistant：

[![Install with HACS](https://img.shields.io/badge/HACS-Install-blue?style=for-the-badge&logo=homeassistant)](https://my.home-assistant.io/redirect/hacs_repository/?owner=yyqclhy&repository=RosCard&category=plugin)


