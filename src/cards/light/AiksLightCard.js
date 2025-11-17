// src/cards/light/AiksLightCard.js
import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksLightCard extends AiksControlBase {
  constructor() {
    super();
    this._translations = {
      zh: {
        ...this._translations.zh,
        brightness: '亮度',
        color: '颜色',
        colorTemp: '色温',
        scene: '场景'
      },
      en: {
        ...this._translations.en,
        brightness: 'Brightness',
        color: 'Color',
        colorTemp: 'Color Temp',
        scene: 'Scene'
      }
    };
    
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = {
      ...config,
      light_name: config.light_name || (this._language === 'zh' ? '未命名灯光' : 'Unnamed Light'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/community/RosCard/icon_img/icon_light.png',
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
    card.header = this._translations[this._language].cardTitle(this._config.light_name);
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((entity) => {
        if (entity.entity_id && entity.entity_id.startsWith('light.')) {
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '12px';
          wrapper.style.padding = '8px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '4px';

          // 显示当前状态
          const state = this._hass.states[entity.entity_id];
          const stateText = state?.state === 'on' 
            ? this._translations[this._language].stateOn 
            : this._translations[this._language].stateOff;
          
          wrapper.innerHTML = `<div style="margin-bottom: 8px;"><strong>${entity.entity_id}</strong> - ${stateText}</div>`;

          // 开关按钮
          const toggleBtn = this._createButton(
            state?.state === 'on' ? 'Off' : 'On',
            () => {
              const service = state?.state === 'on' ? 'turn_off' : 'turn_on';
              this._hass.callService('light', service, { entity_id: entity.entity_id });
            }
          );
          wrapper.appendChild(toggleBtn);

          // 亮度控制
          if (state?.attributes?.brightness !== undefined) {
            const brightness = Math.round((state.attributes.brightness / 255) * 100);
            const brightnessSlider = document.createElement('input');
            brightnessSlider.type = 'range';
            brightnessSlider.min = '0';
            brightnessSlider.max = '100';
            brightnessSlider.value = brightness;
            brightnessSlider.style.width = '100%';
            brightnessSlider.style.marginTop = '8px';
            brightnessSlider.addEventListener('change', (e) => {
              const value = Math.round((e.target.value / 100) * 255);
              this._hass.callService('light', 'turn_on', {
                entity_id: entity.entity_id,
                brightness: value
              });
            });
            wrapper.appendChild(brightnessSlider);
          }

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

// src/cards/light/AiksLightCardEditor.js
export class AiksLightCardEditor extends AiksControlBase {
  setConfig(config) {
    this._config = config || {};
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    this.innerHTML = '';
    const container = document.createElement('div');
    container.style.padding = '16px';

    // 灯光名称
    const nameLabel = document.createElement('label');
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '8px';
    nameLabel.innerText = '灯光名称:';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = this._config?.light_name || '';
    nameInput.style.width = '100%';
    nameInput.style.padding = '8px';
    nameInput.style.boxSizing = 'border-box';
    nameInput.addEventListener('change', (e) => {
      this._config.light_name = e.target.value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
    });

    container.appendChild(nameLabel);
    container.appendChild(nameInput);

    // 实体管理
    const entityContainer = document.createElement('div');
    entityContainer.style.marginTop = '16px';

    const entityTitle = document.createElement('h4');
    entityTitle.innerText = 'Light Entities';
    entityContainer.appendChild(entityTitle);

    if (!Array.isArray(this._config?.entities)) {
      this._config.entities = [];
    }

    this._config.entities.forEach((entity, index) => {
      const row = document.createElement('div');
      row.style.marginBottom = '8px';
      row.style.display = 'flex';
      row.style.gap = '8px';

      const select = document.createElement('select');
      select.style.flex = '1';
      select.innerHTML = '<option value="">Select Light Entity</option>';

      Object.keys(this._hass?.states || {})
        .filter(id => id.startsWith('light.'))
        .forEach(entityId => {
          const option = document.createElement('option');
          option.value = entityId;
          option.text = entityId;
          if (entityId === entity.entity_id) option.selected = true;
          select.appendChild(option);
        });

      select.addEventListener('change', (e) => {
        this._config.entities[index].entity_id = e.target.value;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      });

      const delBtn = this._createButton('Delete', () => {
        this._config.entities.splice(index, 1);
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
        this.render();
      });

      row.appendChild(select);
      row.appendChild(delBtn);
      entityContainer.appendChild(row);
    });

    const addBtn = this._createButton('Add Light', () => {
      this._config.entities.push({ entity_id: '' });
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      this.render();
    });

    entityContainer.appendChild(addBtn);
    container.appendChild(entityContainer);
    this.appendChild(container);
  }
}