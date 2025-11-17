// ========== 导入基类 ==========
import { AiksControlBase } from './base/AiksControlBase.js';

// ========== 导入TV卡片 ==========
import { AiksTvCard } from './cards/tv/AiksTvCard.js';
import { AiksTvCardEditor } from './cards/tv/AiksTvCardEditor.js';

// ========== 导入Light卡片 ==========
import { AiksLightCard } from './cards/light/AiksLightCard.js';
import { AiksLightCardEditor } from './cards/light/AiksLightCardEditor.js';

// ========== 导入Fan卡片 ==========
import { AiksFanCard } from './cards/fan/AiksFanCard.js';
import { AiksFanCardEditor } from './cards/fan/AiksFanCardEditor.js';

// ========== 导入Scene卡片 ==========
import { AiksSceneCard } from './cards/scene/AiksSceneCard.js';
import { AiksSceneCardEditor } from './cards/scene/AiksSceneCardEditor.js';

// ========== 导入MediaPlayer卡片 ==========
import { AiksMediaPlayerCard } from './cards/media-player/AiksMediaPlayerCard.js';
import { AiksMediaPlayerCardEditor } from './cards/media-player/AiksMediaPlayerCardEditor.js';

// ========== 导入Climate卡片 ==========
import { AiksClimateCard } from './cards/climate/AiksClimateCard.js';
import { AiksClimateCardEditor } from './cards/climate/AiksClimateCardEditor.js';

// ========== 导入Cover卡片 ==========
import { AiksCoverCard } from './cards/cover/AiksCoverCard.js';
import { AiksCoverCardEditor } from './cards/cover/AiksCoverCardEditor.js';

// ========== 导入Switch卡片 ==========
import { AiksSwitchCard } from './cards/switch/AiksSwitchCard.js';
import { AiksSwitchCardEditor } from './cards/switch/AiksSwitchCardEditor.js';

// ========== 导入Weather卡片 ==========
import { AiksWeatherCard } from './cards/weather/AiksWeatherCard.js';
import { AiksWeatherCardEditor } from './cards/weather/AiksWeatherCardEditor.js';

// ========== 导入Host卡片 ==========
import { AiksHostCard } from './cards/host/AiksHostCard.js';
import { AiksHostCardEditor } from './cards/host/AiksHostCardEditor.js';

// ========== 注册所有卡片 ==========
customElements.define('aiks-tv-card', AiksTvCard);
customElements.define('aiks-tv-card-editor', AiksTvCardEditor);

customElements.define('aiks-light-card', AiksLightCard);
customElements.define('aiks-light-card-editor', AiksLightCardEditor);

customElements.define('aiks-fan-card', AiksFanCard);
customElements.define('aiks-fan-card-editor', AiksFanCardEditor);

customElements.define('aiks-scene-card', AiksSceneCard);
customElements.define('aiks-scene-card-editor', AiksSceneCardEditor);

customElements.define('aiks-media-player-card', AiksMediaPlayerCard);
customElements.define('aiks-media-player-card-editor', AiksMediaPlayerCardEditor);

customElements.define('aiks-climate-card', AiksClimateCard);
customElements.define('aiks-climate-card-editor', AiksClimateCardEditor);

customElements.define('aiks-cover-card', AiksCoverCard);
customElements.define('aiks-cover-card-editor', AiksCoverCardEditor);

customElements.define('aiks-switch-card', AiksSwitchCard);
customElements.define('aiks-switch-card-editor', AiksSwitchCardEditor);

customElements.define('aiks-weather-card', AiksWeatherCard);
customElements.define('aiks-weather-card-editor', AiksWeatherCardEditor);

customElements.define('aiks-host-card', AiksHostCard);
customElements.define('aiks-host-card-editor', AiksHostCardEditor);

// ========== 向Home Assistant注册卡片 ==========
window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: 'aiks-tv-card',
    name: navigator.language.startsWith('zh') ? '电视(ROS)' : 'TV(ROS)',
    description: navigator.language.startsWith('zh') ? '电视卡片' : 'TV Card',
    preview: true
  },
  {
    type: 'aiks-light-card',
    name: navigator.language.startsWith('zh') ? '灯光(ROS)' : 'Light(ROS)',
    description: navigator.language.startsWith('zh') ? '灯光卡片' : 'Light Card',
    preview: true
  },
  {
    type: 'aiks-fan-card',
    name: navigator.language.startsWith('zh') ? '风扇(ROS)' : 'Fan(ROS)',
    description: navigator.language.startsWith('zh') ? '风扇卡片' : 'Fan Card',
    preview: true
  },
  {
    type: 'aiks-scene-card',
    name: navigator.language.startsWith('zh') ? '场景(ROS)' : 'Scene(ROS)',
    description: navigator.language.startsWith('zh') ? '场景卡片' : 'Scene Card',
    preview: true
  },
  {
    type: 'aiks-media-player-card',
    name: navigator.language.startsWith('zh') ? '媒体播放器(ROS)' : 'Media Player(ROS)',
    description: navigator.language.startsWith('zh') ? '媒体播放器卡片' : 'Media Player Card',
    preview: true
  },
  {
    type: 'aiks-climate-card',
    name: navigator.language.startsWith('zh') ? '空调(ROS)' : 'AC(ROS)',
    description: navigator.language.startsWith('zh') ? '空调卡片' : 'AC Card',
    preview: true
  },
  {
    type: 'aiks-cover-card',
    name: navigator.language.startsWith('zh') ? '窗帘(ROS)' : 'Cover(ROS)',
    description: navigator.language.startsWith('zh') ? '窗帘卡片' : 'Cover Card',
    preview: true
  },
  {
    type: 'aiks-switch-card',
    name: navigator.language.startsWith('zh') ? '开关(ROS)' : 'Switch(ROS)',
    description: navigator.language.startsWith('zh') ? '开关卡片' : 'Switch Card',
    preview: true
  },
  {
    type: 'aiks-weather-card',
    name: navigator.language.startsWith('zh') ? '天气(ROS)' : 'Weather(ROS)',
    description: navigator.language.startsWith('zh') ? '天气卡片' : 'Weather Card',
    preview: true
  },
  {
    type: 'aiks-host-card',
    name: navigator.language.startsWith('zh') ? '主机(ROS)' : 'Host(ROS)',
    description: navigator.language.startsWith('zh') ? '主机卡片' : 'Host Card',
    preview: true
  }
);

console.log('✅ Aiks Custom Cards loaded successfully!');