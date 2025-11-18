// src/cards/light/AiksLightCard.js
import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksLightCard extends AiksControlBase {
  constructor() {
    super();
    this._translations = {
      zh: {
        ...this._translations.zh,
        brightness: '亮度',
        color: '颜色',
        colorTemp: '色温',
        scene: '场景'
      },
      en: {
        ...this._translations.en,
        brightness: 'Brightness',
        color: 'Color',
        colorTemp: 'Color Temp',
        scene: 'Scene'
      }
    };
    
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      light_name: config.light_name || (this._language === 'zh' ? '未命名灯光' : 'Unnamed Light'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_light.png',
    };
    if (this._hass) this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.firstRender) {
      if (this._config) this.render();
      this.firstRender = false;
    }
  }

  render() {
    if (!this._hass) return;

    this.innerHTML = '';
    const card = document.createElement('ha-card');
    card.header = this._translations[this._language].cardTitle(this._config.light_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('light.')) {
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '12px';
          wrapper.style.padding = '8px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '4px';

          // 显示当前状态
          const state = this._hass.states[entity.entity_id];
          const stateText = state?.state === 'on' 
            ? this._translations[this._language].stateOn 
            : this._translations[this._language].stateOff;
          
          wrapper.innerHTML = `<div style="margin-bottom: 8px;"><strong>${entity.entity_id}</strong> - ${stateText}</div>`;

          // 开关按钮
          const toggleBtn = this._createButton(
            state?.state === 'on' ? 'Off' : 'On',
            () => {
              const service = state?.state === 'on' ? 'turn_off' : 'turn_on';
              this._hass.callService('light', service, { entity_id: entity.entity_id });
            }
          );
          wrapper.appendChild(toggleBtn);

          // 亮度控制
          if (state?.attributes?.brightness !== undefined) {
            const brightness = Math.round((state.attributes.brightness / 255) * 100);
            const brightnessSlider = document.createElement('input');
            brightnessSlider.type = 'range';
            brightnessSlider.min = '0';
            brightnessSlider.max = '100';
            brightnessSlider.value = brightness;
            brightnessSlider.style.width = '100%';
            brightnessSlider.style.marginTop = '8px';
            brightnessSlider.addEventListener('change', (e) => {
              const value = Math.round((e.target.value / 100) * 255);
              this._hass.callService('light', 'turn_on', {
                entity_id: entity.entity_id,
                brightness: value
              });
            });
            wrapper.appendChild(brightnessSlider);
          }

          controlPanel.appendChild(wrapper);
        }
      });
    }

    card.appendChild(controlPanel);
    this.appendChild(card);
  }

  getCardSize() {
    return 4;
  }

      static async getConfigElement() {
    return document.createElement('aiks-light-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

