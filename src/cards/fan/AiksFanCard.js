import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksFanCard extends AiksControlBase {
  constructor() {
    super();
    this._translations = {
      zh: {
        ...this._translations.zh,
        speed: '速度',
        oscillate: '摆动',
        direction: '方向'
      },
      en: {
        ...this._translations.en,
        speed: 'Speed',
        oscillate: 'Oscillate',
        direction: 'Direction'
      }
    };
    
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      fan_name: config.fan_name || (this._language === 'zh' ? '未命名风扇' : 'Unnamed Fan'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_fan.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.fan_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('fan.')) {
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '12px';
          wrapper.style.padding = '8px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '4px';

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
              this._hass.callService('fan', service, { entity_id: entity.entity_id });
            }
          );
          wrapper.appendChild(toggleBtn);

          // 速度控制
          if (state?.attributes?.percentage !== undefined) {
            const speedSlider = document.createElement('input');
            speedSlider.type = 'range';
            speedSlider.min = '0';
            speedSlider.max = '100';
            speedSlider.value = state.attributes.percentage || 0;
            speedSlider.style.width = '100%';
            speedSlider.style.marginTop = '8px';
            speedSlider.addEventListener('change', (e) => {
              this._hass.callService('fan', 'set_percentage', {
                entity_id: entity.entity_id,
                percentage: parseInt(e.target.value)
              });
            });
            wrapper.appendChild(speedSlider);
          }

          // 摆动控制
          if (state?.attributes?.oscillating !== undefined) {
            const oscillateBtn = this._createButton(
              state.attributes.oscillating ? 'Stop Oscillate' : 'Start Oscillate',
              () => {
                this._hass.callService('fan', 'oscillate', {
                  entity_id: entity.entity_id,
                  oscillating: !state.attributes.oscillating
                });
              }
            );
            wrapper.appendChild(oscillateBtn);
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
}