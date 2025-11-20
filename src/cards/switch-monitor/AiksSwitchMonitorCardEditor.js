import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksSwitchMonitorCardEditor extends AiksControlBase {
  constructor() {
    super();
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  setConfig(config) {
    const newConfig = { ...config };
    if (!newConfig.id) newConfig.id = this.generateUUID();

    this._config = {
      type: newConfig.type || 'custom:aiks-switch-monitor-card',
      id: newConfig.id,
      monitor_name: newConfig.monitor_name || (this._language === 'zh' ? '未命名监听' : 'Unnamed Monitor')
    };

    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.firstRender) {
      this.render();
      this.firstRender = false;
    }
  }

  render() {
    if (!this._config || !this._hass) return;
    this.innerHTML = '';

    const container = document.createElement('div');
    container.style.padding = '16px';

    // 卡片名称输入
    const nameWrapper = document.createElement('div');
    nameWrapper.style.marginBottom = '16px';
    nameWrapper.style.display = 'flex';
    nameWrapper.style.alignItems = 'center';

    const nameLabel = document.createElement('span');
    nameLabel.innerText = this._language === 'zh' ? '卡片名称: ' : 'Card Name: ';
    nameLabel.style.width = '100px';
    nameWrapper.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = this._config.monitor_name;
    nameInput.style.width = '200px';
    nameInput.style.padding = '6px';
    nameInput.addEventListener('blur', () => {
      this._config.monitor_name = nameInput.value;
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: { ...this._config } },
        bubbles: true,
        composed: true
      }));
    });
    nameWrapper.appendChild(nameInput);
    container.appendChild(nameWrapper);

    // ID显示（自动生成）
    const idWrapper = document.createElement('div');
    idWrapper.style.marginBottom = '16px';
    idWrapper.style.display = 'flex';
    idWrapper.style.alignItems = 'center';

    const idLabel = document.createElement('span');
    idLabel.innerText = 'ID: ';
    idLabel.style.width = '100px';
    idLabel.style.fontWeight = '600';
    idWrapper.appendChild(idLabel);

    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.value = this._config.id;
    idInput.style.width = '200px';
    idInput.style.padding = '6px';
    idInput.style.fontFamily = 'monospace';
    idInput.addEventListener('blur', () => {
      this._config.id = idInput.value;
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: { ...this._config } },
        bubbles: true,
        composed: true
      }));
    });
    idWrapper.appendChild(idInput);
    container.appendChild(idWrapper);

    this.appendChild(container);
  }
}