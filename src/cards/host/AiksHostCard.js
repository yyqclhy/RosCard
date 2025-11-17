import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksHostCard extends AiksControlBase {
  constructor() {
    super();
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      host_name: config.host_name || (this._language === 'zh' ? '未命名主机' : 'Unnamed Host'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_host.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.host_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('remote.')) {
          const state = this._hass.states[entity.entity_id];
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '12px';
          wrapper.style.padding = '8px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '4px';

          wrapper.innerHTML = `<div style="margin-bottom: 8px;"><strong>${entity.entity_id}</strong></div>`;

          // 主机命令按钮
          const commands = entity.commands || [];
          commands.forEach((cmd) => {
            const cmdBtn = this._createButton(cmd.label || cmd, () => {
              this._hass.callService('remote', 'send_command', {
                entity_id: entity.entity_id,
                command: cmd.value || cmd
              });
            });
            wrapper.appendChild(cmdBtn);
          });

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