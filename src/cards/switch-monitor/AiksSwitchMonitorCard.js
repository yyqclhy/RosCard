import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksSwitchMonitorCard extends AiksControlBase {
  constructor() {
    super();
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      id: config.id || this.generateUUID(),
      monitor_name: config.monitor_name || (this._language === 'zh' ? '未命名监听' : 'Unnamed Monitor')
    };
    if (this._hass) this.render();
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
    card.header = this._config.monitor_name;

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';

    const idDiv = document.createElement('div');
    idDiv.style.marginBottom = '16px';
    idDiv.style.padding = '12px';
    idDiv.style.backgroundColor = '#f5f5f5';
    idDiv.style.borderRadius = '4px';
    idDiv.innerHTML = `
      <div><strong>ID:</strong> ${this._config.id}</div>
    `;
    controlPanel.appendChild(idDiv);

    card.appendChild(controlPanel);
    this.appendChild(card);
  }

  static async getConfigElement() {
    return document.createElement('aiks-switch-monitor-card-editor');
  }

  static getStubConfig() {
    const language = navigator.language.startsWith('zh') ? 'zh' : 'en';
    return {
      id: 'switch-monitor-' + Date.now(),
      monitor_name: language === 'zh' ? '未命名监听' : 'Unnamed Monitor'
    };
  }
}