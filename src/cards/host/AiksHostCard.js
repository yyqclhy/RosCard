import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksHostCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_host.png' // 自定义图标路径
    };
    if (this._hass) this.render();
  }

  set hass(hass) {
    this._hass = hass;
    // 首次渲染时才加载图片和其他资源
    if (this.firstRender) {
      if (this._config) this.render();
      this.firstRender = false;  // 标记首次渲染已完成
    }
  }

  render() {
    if (!this._hass || !this._config) return;
    this.innerHTML = '';

    const card = document.createElement('ha-card');
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '主机控制' : 'Host Control');

    // 添加图片
    card.appendChild(this._createIcon(this._config.icon_path));

    const content = document.createElement('div');
    content.style.padding = '16px';
    content.style.position = 'relative';

    if (this._config.entities.length > 0) {
      this._config.entities.forEach(entity => {
        const friendlyName = this._hass.states[entity.entity_id]?.attributes?.friendly_name || entity.entity_id;
        const entityDiv = document.createElement('div');
        entityDiv.style.marginBottom = '10px';
        entityDiv.innerHTML = `<div>${this._translations[this._language].entity}: ${friendlyName}</div>`;
        content.appendChild(entityDiv);
      });
    } else {
      content.innerHTML = `<div>${this._translations[this._language].validEntity}</div>`;
    }

    card.appendChild(content);
    this.appendChild(card);
  }

  static async getConfigElement() {
    return document.createElement('aiks-host-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}