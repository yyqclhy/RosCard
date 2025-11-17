import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksSwitchCard extends AiksControlBase {
  constructor() {
    super();
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      switch_name: config.switch_name || (this._language === 'zh' ? '未命名开关' : 'Unnamed Switch'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_switch.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.switch_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('switch.')) {
          const state = this._hass.states[entity.entity_id];
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '8px';

          const stateText = state?.state === 'on' 
            ? this._translations[this._language].stateOn 
            : this._translations[this._language].stateOff;

          const btn = this._createButton(
            `${entity.entity_id}: ${stateText}`,
            () => {
              const service = state?.state === 'on' ? 'turn_off' : 'turn_on';
              this._hass.callService('switch', service, { entity_id: entity.entity_id });
            }
          );
          btn.style.width = '100%';
          btn.style.padding = '12px';
          wrapper.appendChild(btn);
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