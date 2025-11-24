import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksSwitchMonitorCard extends AiksControlBase {
  constructor() {
    super();
    this.addEventListener('config-changed', (e) => this.setConfig(e.detail.config));
  }

  setConfig(config) {
    this._config = {
      ...config,
      id: config.id || this.generateUUID(),

      device_types: {
        light: true,
        switch: true,
        climate: true,
        ...(config.device_types || {})
      }
    };
    if (this._hass) this.render();
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) this.render();
  }

  // 把当前启用的类型转成友好文字
  getEnabledTypesText() {
    const map = {
      light: this._language === 'zh' ? '灯' : 'Light',
      switch: this._language === 'zh' ? '开关' : 'Switch',
      climate: this._language === 'zh' ? '空调' : 'Climate'
    };
    const enabled = Object.keys(this._config.device_types)
      .filter(k => this._config.device_types[k])
      .map(k => map[k])
      .join('、');

    const prefix = this._language === 'zh' ? '已启用：' : 'Enabled: ';
    return enabled ? prefix + enabled : (this._language === 'zh' ? '无' : 'None');
  }

  render() {
    if (!this._hass || !this._config) return;
    this.innerHTML = '';

    const card = document.createElement('ha-card');
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '统计' : 'Statistics');

    const content = document.createElement('div');
    content.style.padding = '16px';


    // 设备类型提示
    const typeBox = document.createElement('div');
    typeBox.style.padding = '10px 12px';
    typeBox.style.backgroundColor = '#e3f2fd';
    typeBox.style.borderRadius = '8px';
    typeBox.style.color = '#1565c0';
    typeBox.style.fontSize = '0.95em';
    typeBox.textContent = this.getEnabledTypesText();
    content.appendChild(typeBox);

    card.appendChild(content);
    this.appendChild(card);
  }

  static async getConfigElement() {
    await import('./AiksSwitchMonitorCardEditor.js');
    return document.createElement('aiks-switch-monitor-card-editor');
  }

  static getStubConfig() {
    const lang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    return {
      monitor_name: lang === 'zh' ? '未命名监听' : 'Unnamed Monitor',
      device_types: { light: true, switch: true, climate: true }
    };
  }
}