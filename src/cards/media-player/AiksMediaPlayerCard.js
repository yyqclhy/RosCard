import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksMediaPlayerCard extends AiksControlBase {
  constructor() {
    super();
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      media_name: config.media_name || (this._language === 'zh' ? '未命名播放器' : 'Unnamed Player'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_media_play1.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.media_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('media_player.')) {
          const state = this._hass.states[entity.entity_id];
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '12px';
          wrapper.style.padding = '8px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '4px';

          wrapper.innerHTML = `<div style="margin-bottom: 8px;"><strong>${entity.entity_id}</strong> - ${state?.state || 'unknown'}</div>`;

          const playBtn = this._createButton('Play', () => {
            this._hass.callService('media_player', 'media_play', { entity_id: entity.entity_id });
          });

          const pauseBtn = this._createButton('Pause', () => {
            this._hass.callService('media_player', 'media_pause', { entity_id: entity.entity_id });
          });

          const stopBtn = this._createButton('Stop', () => {
            this._hass.callService('media_player', 'media_stop', { entity_id: entity.entity_id });
          });

          wrapper.appendChild(playBtn);
          wrapper.appendChild(pauseBtn);
          wrapper.appendChild(stopBtn);
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