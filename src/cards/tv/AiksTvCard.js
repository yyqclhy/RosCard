import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksTvCard extends AiksControlBase {
  constructor() {
    super();
    this._translations = {
      ...this._translations,
      zh: {
        ...this._translations.zh,
        mediaCommands: [
          { label: '播放', value: 'media_play' },
          { label: '暂停', value: 'media_pause' },
          { label: '音量增加', value: 'volume_up' },
          { label: '音量减少', value: 'volume_down' },
          { label: '静音', value: 'volume_mute_true' },
          { label: '取消静音', value: 'volume_mute_false' }
        ]
      },
      en: {
        ...this._translations.en,
        mediaCommands: [
          { label: 'Play', value: 'media_play' },
          { label: 'Pause', value: 'media_pause' },
          { label: 'Volume Up', value: 'volume_up' },
          { label: 'Volume Down', value: 'volume_down' },
          { label: 'Mute', value: 'volume_mute_true' },
          { label: 'Unmute', value: 'volume_mute_false' }
        ]
      }
    };
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = { 
      ...config, 
      tv_name: config.tv_name || (this._language === 'zh' ? '未命名电视' : 'Unnamed TV'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_tv.png', // 自定义图标路径 
      tv_type: config.tv_type || 'android_tv', // 新增属性，默认 android_tv
    };
    if (this._hass) this.render();
  }

  set hass(hass) {
    this._hass = hass;
        // 首次渲染时才加载图片和其他资源
    if (this.firstRender) {
          if (this._config) this.render();
      this.firstRender = false;  // 标记首次渲染已完成
    }
  }

  render() {
    if (!this._hass) return;

    this.innerHTML = '';

    const card = document.createElement('ha-card');
    card.header = this._translations[this._language].cardTitle(this._config.tv_name);

    // 添加图片
    card.appendChild(this._createIcon(this._config.icon_path));


    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((config) => {
        if (config.type === 'media_player' && config.commands) {
          Object.entries(config.commands).forEach(([command, service]) => {
            const cmdWrapper = document.createElement('div');
            cmdWrapper.innerHTML = `<span>${config.entity_id}: ${command}</span>`;
            const sendButton = this._createButton(this._translations[this._language].sendButton, () => {
              if (service === 'volume_mute') {
                this._hass.callService(config.type, service, { 
                  entity_id: config.entity_id, 
                  is_volume_muted: command.includes('静音') || command.includes('Mute') ? true : false 
                });
              } else {
                this._hass.callService(config.type, service, { entity_id: config.entity_id });
              }
            });
            cmdWrapper.appendChild(sendButton);
            controlPanel.appendChild(cmdWrapper);
          });
        } else if (config.type === 'remote' && config.commands) {
          Object.entries(config.commands).forEach(([command, value]) => {
            const cmdWrapper = document.createElement('div');
            cmdWrapper.innerHTML = `<span>${config.entity_id}: ${command} = ${value}</span>`;
            const sendButton = this._createButton(this._translations[this._language].testButton, () => {
              this._hass.callService(config.type, 'send_command', { entity_id: config.entity_id, command: value });
            });
            cmdWrapper.appendChild(sendButton);
            controlPanel.appendChild(cmdWrapper);
          });
        } else if (config.type === 'select' && config.commands) {
          Object.entries(config.commands).forEach(([command, value]) => {
            const cmdWrapper = document.createElement('div');
            cmdWrapper.innerHTML = `<span>${config.entity_id}: ${command} = ${value}</span>`;
            const sendButton = this._createButton(this._translations[this._language].testButton, () => {
              this._hass.callService(config.type, 'select_option', { entity_id: config.entity_id, option: value });
            });
            cmdWrapper.appendChild(sendButton);
            controlPanel.appendChild(cmdWrapper);
          });
        }
      });
    }

    card.appendChild(controlPanel);
    this.appendChild(card);
  }

  static async getConfigElement() {
    return document.createElement('aiks-tv-card-editor');
  }

  static getStubConfig() {
    const language = navigator.language.startsWith('zh') ? 'zh' : 'en';
    return {
      tv_name: language === 'zh' ? '未命名电视' : 'Unnamed TV',
      entities: [],
      tv_type: 'android_tv', // 默认 Android TV
      media_play_entity: ''  // 播放器实体默认空
    };
  }
}