import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksClimateCard extends AiksControlBase {
  constructor() {
    super();
    this._translations = {
      zh: {
        ...this._translations.zh,
        temperature: '温度',
        humidity: '湿度',
        mode: '模式'
      },
      en: {
        ...this._translations.en,
        temperature: 'Temperature',
        humidity: 'Humidity',
        mode: 'Mode'
      }
    };
    
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      climate_name: config.climate_name || (this._language === 'zh' ? '未命名空调' : 'Unnamed AC'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_climate.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.climate_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('climate.')) {
          const state = this._hass.states[entity.entity_id];
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '12px';
          wrapper.style.padding = '8px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '4px';

          const temp = state?.attributes?.current_temperature || '--';
          const targetTemp = state?.attributes?.temperature || '--';
          
          wrapper.innerHTML = `
            <div style="margin-bottom: 8px;">
              <strong>${entity.entity_id}</strong><br/>
              ${this._translations[this._language].temperature}: ${temp}°C → ${targetTemp}°C
            </div>
          `;

          const onBtn = this._createButton('On', () => {
            this._hass.callService('climate', 'turn_on', { entity_id: entity.entity_id });
          });

          const offBtn = this._createButton('Off', () => {
            this._hass.callService('climate', 'turn_off', { entity_id: entity.entity_id });
          });

          wrapper.appendChild(onBtn);
          wrapper.appendChild(offBtn);
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
    return document.createElement('aiks-climate-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}