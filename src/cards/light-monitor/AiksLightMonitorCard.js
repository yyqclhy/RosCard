import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksLightMonitorCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      lights: Array.isArray(config?.lights) ? [...config.lights] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_light.png' // 自定义图标路径
    };
    if (this._hass) this.render();
  }

  set hass(hass) {
    this._hass = hass;
    // 首次渲染时才加载图片和其他资源
    if (this.firstRender) {
      if (this._config) this.render();
      this.firstRender = false;  // 标记首次渲染已完成
    } else {
      // 后续状态变化时更新
      if (this._config) this.render();
    }
  }

  render() {
    if (!this._hass || !this._config) return;
    this.innerHTML = '';

    const card = document.createElement('ha-card');
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '灯光监听' : 'Light Monitor');

    // 添加图片
    card.appendChild(this._createIcon(this._config.icon_path));

    const content = document.createElement('div');
    content.style.padding = '16px';
    content.style.position = 'relative';

    // 获取灯的状态
    const lightsData = this._getLightsData();
    const onCount = lightsData.filter(l => l.state === 'on').length;
    const offCount = lightsData.filter(l => l.state === 'off').length;
    const totalCount = lightsData.length;

    // 统计信息卡片
    const statsDiv = document.createElement('div');
    statsDiv.style.display = 'grid';
    statsDiv.style.gridTemplateColumns = '1fr 1fr 1fr';
    statsDiv.style.gap = '10px';
    statsDiv.style.marginBottom = '16px';

    // 打开的灯数
    const onStat = document.createElement('div');
    onStat.style.cssText = `
      background: #c8e6c9;
      padding: 12px;
      border-radius: 4px;
      text-align: center;
    `;
    onStat.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">${onCount}</div>
      <div style="font-size: 12px; color: #1b5e20; margin-top: 4px;">${this._language === 'zh' ? '打开' : 'On'}</div>
    `;
    statsDiv.appendChild(onStat);

    // 关闭的灯数
    const offStat = document.createElement('div');
    offStat.style.cssText = `
      background: #ffcdd2;
      padding: 12px;
      border-radius: 4px;
      text-align: center;
    `;
    offStat.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; color: #c62828;">${offCount}</div>
      <div style="font-size: 12px; color: #b71c1c; margin-top: 4px;">${this._language === 'zh' ? '关闭' : 'Off'}</div>
    `;
    statsDiv.appendChild(offStat);

    // 总数
    const totalStat = document.createElement('div');
    totalStat.style.cssText = `
      background: #bbdefb;
      padding: 12px;
      border-radius: 4px;
      text-align: center;
    `;
    totalStat.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; color: #1565c0;">${totalCount}</div>
      <div style="font-size: 12px; color: #0d47a1; margin-top: 4px;">${this._language === 'zh' ? '总计' : 'Total'}</div>
    `;
    statsDiv.appendChild(totalStat);

    content.appendChild(statsDiv);

    // 灯列表
    if (lightsData.length > 0) {
      // 打开的灯
      const onLights = lightsData.filter(l => l.state === 'on');
      // ✅ 记录打开的灯实体 id
      this._openLightEntityIds = onLights.map(l => l.entity_id);
      card.dataset.openLights = JSON.stringify(this._openLightEntityIds);
      if (onLights.length > 0) {
        const onTitle = document.createElement('div');
        onTitle.style.cssText = `
          font-size: 12px;
          font-weight: 500;
          color: #666;
          margin-top: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
        `;
        onTitle.textContent = `${this._language === 'zh' ? '打开的灯' : 'Open Lights'} (${onLights.length})`;
        content.appendChild(onTitle);

        onLights.forEach(light => {
          const lightItem = this._createLightItem(light, true);
          content.appendChild(lightItem);
        });
      }

      // 关闭的灯
      const offLights = lightsData.filter(l => l.state === 'off');
      if (offLights.length > 0) {
        const offTitle = document.createElement('div');
        offTitle.style.cssText = `
          font-size: 12px;
          font-weight: 500;
          color: #666;
          margin-top: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
        `;
        offTitle.textContent = `${this._language === 'zh' ? '关闭的灯' : 'Closed Lights'} (${offLights.length})`;
        content.appendChild(offTitle);

        offLights.forEach(light => {
          const lightItem = this._createLightItem(light, false);
          content.appendChild(lightItem);
        });
      }
    } else {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = `
        text-align: center;
        color: #999;
        padding: 20px;
      `;
      emptyDiv.textContent = this._language === 'zh' ? '未监听任何灯' : 'No lights monitored';
      content.appendChild(emptyDiv);
    }

    card.appendChild(content);
    this.appendChild(card);
  }

  _getLightsData() {
    if (!Array.isArray(this._config.lights)) {
      return [];
    }

    return this._config.lights
      .map(lightId => {
        const state = this._hass.states[lightId];
        return {
          entity_id: lightId,
          friendly_name: state?.attributes?.friendly_name || lightId,
          state: state?.state || 'unavailable'
        };
      })
      .filter(light => light.state !== undefined);
  }

  _createLightItem(light, isOn) {
    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #333131ff;
      border-radius: 4px;
      margin-bottom: 6px;
      font-size: 13px;
    `;

    const nameDiv = document.createElement('div');
    nameDiv.style.flex = '1';
    nameDiv.innerHTML = `
      <div style="font-weight: 500; margin-bottom: 4px;">${light.friendly_name}</div>
      <div style="font-size: 11px; color: #999;">${light.entity_id}</div>
    `;
    itemDiv.appendChild(nameDiv);

    const stateSpan = document.createElement('span');
    stateSpan.style.cssText = `
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      background: ${isOn ? '#c8e6c9' : '#ffcdd2'};
      color: ${isOn ? '#2e7d32' : '#c62828'};
      margin-left: 8px;
    `;
    stateSpan.textContent = isOn ? 'ON' : 'OFF';
    itemDiv.appendChild(stateSpan);

    return itemDiv;
  }

  static async getConfigElement() {
    return document.createElement('aiks-light-monitor-card-editor');
  }

  static getStubConfig() {
    return { lights: [] };
  }
}