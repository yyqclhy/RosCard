import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksCoverCard extends AiksControlBase {
  constructor() {
    super();
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      cover_name: config.cover_name || (this._language === 'zh' ? '未命名窗帘' : 'Unnamed Cover'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_cover.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.cover_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('cover.')) {
          const state = this._hass.states[entity.entity_id];
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '12px';
          wrapper.style.padding = '8px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '4px';

          const position = state?.attributes?.current_position || 0;
          wrapper.innerHTML = `<div style="margin-bottom: 8px;"><strong>${entity.entity_id}</strong> - Position: ${position}%</div>`;

          const openBtn = this._createButton('Open', () => {
            this._hass.callService('cover', 'open_cover', { entity_id: entity.entity_id });
          });

          const closeBtn = this._createButton('Close', () => {
            this._hass.callService('cover', 'close_cover', { entity_id: entity.entity_id });
          });

          const stopBtn = this._createButton('Stop', () => {
            this._hass.callService('cover', 'stop_cover', { entity_id: entity.entity_id });
          });

          wrapper.appendChild(openBtn);
          wrapper.appendChild(closeBtn);
          wrapper.appendChild(stopBtn);

          // 位置滑块
          if (state?.attributes?.current_position !== undefined) {
            const posSlider = document.createElement('input');
            posSlider.type = 'range';
            posSlider.min = '0';
            posSlider.max = '100';
            posSlider.value = position;
            posSlider.style.width = '100%';
            posSlider.style.marginTop = '8px';
            posSlider.addEventListener('change', (e) => {
              this._hass.callService('cover', 'set_cover_position', {
                entity_id: entity.entity_id,
                position: parseInt(e.target.value)
              });
            });
            wrapper.appendChild(posSlider);
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