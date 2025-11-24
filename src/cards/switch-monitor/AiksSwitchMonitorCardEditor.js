import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksSwitchMonitorCardEditor extends AiksControlBase {
  constructor() {
    super();
    this.deviceTypes = {
      light: true,
      switch: true,
      climate: true
    };
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
      monitor_name: newConfig.monitor_name || (this._language === 'zh' ? '统计卡片' : 'Unnamed Monitor'),
      device_types: newConfig.device_types || {
        light: true,
        switch: true,
        climate: true
      }
    };

    // 初始化设备类型状态
    this.deviceTypes = { ...this._config.device_types };

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

  getCheckedCount() {
    return Object.values(this.deviceTypes).filter(v => v === true).length;
  }

  onCheckboxChange(type) {
    const isCurrentlyChecked = this.deviceTypes[type];
    
    // 如果当前被选中，且只有1个被选中，则不允许取消
    if (isCurrentlyChecked && this.getCheckedCount() === 1) {
      return;
    }

    this.deviceTypes[type] = !this.deviceTypes[type];
    this._config.device_types = { ...this.deviceTypes };

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
      bubbles: true,
      composed: true
    }));

    this.render();
  }

  getDeviceTypeLabel(type) {
    const labels = {
      light: this._language === 'zh' ? '灯' : 'Light',
      switch: this._language === 'zh' ? '开关' : 'Switch',
      climate: this._language === 'zh' ? '空调' : 'Climate'
    };
    return labels[type] || type;
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


    // 设备类型复选框
    const typesLabel = document.createElement('div');
    typesLabel.innerText = this._language === 'zh' ? '设备类型: ' : 'Device Types: ';
    typesLabel.style.marginBottom = '8px';
    typesLabel.style.fontWeight = '600';
    container.appendChild(typesLabel);

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.style.marginBottom = '16px';
    checkboxWrapper.style.paddingLeft = '20px';

    const typeList = ['light', 'switch', 'climate'];
    typeList.forEach(type => {
      const checkboxRow = document.createElement('div');
      checkboxRow.style.marginBottom = '8px';
      checkboxRow.style.display = 'flex';
      checkboxRow.style.alignItems = 'center';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.deviceTypes[type];
      checkbox.style.marginRight = '8px';
      checkbox.style.cursor = 'pointer';
      checkbox.id = `device-type-${type}`;

      // 如果只有1个被选中，禁用该复选框
      if (this.deviceTypes[type] && this.getCheckedCount() === 1) {
        checkbox.disabled = true;
        checkbox.style.cursor = 'not-allowed';
        checkbox.style.opacity = '0.5';
      }

      checkbox.addEventListener('change', () => {
        this.onCheckboxChange(type);
      });

      const label = document.createElement('label');
      label.htmlFor = `device-type-${type}`;
      label.innerText = this.getDeviceTypeLabel(type);
      label.style.cursor = 'pointer';
      label.style.marginBottom = '0';

      checkboxRow.appendChild(checkbox);
      checkboxRow.appendChild(label);
      checkboxWrapper.appendChild(checkboxRow);
    });

    container.appendChild(checkboxWrapper);
    this.appendChild(container);
  }
}