import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksSceneCard extends AiksControlBase {
  constructor() {
    super();
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      scene_name: config.scene_name || (this._language === 'zh' ? '未命名场景' : 'Unnamed Scene'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_scene.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.scene_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('scene.')) {
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '8px';

          const activateBtn = this._createButton(
            entity.scene_name || entity.entity_id,
            () => {
              this._hass.callService('scene', 'turn_on', { entity_id: entity.entity_id });
            }
          );
          activateBtn.style.width = '100%';
          activateBtn.style.padding = '12px';
          wrapper.appendChild(activateBtn);
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
