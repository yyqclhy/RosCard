import { AiksControlBase } from './AiksControlBase.js';

/**
 * 统一为一个灵活的基类
 * 通过配置项控制额外功能的开启和数据结构
 * 优化布局：采用折叠展开式设计
 */
export class AiksUnifiedCardEditor extends AiksControlBase {
  /**
   * 子类必须覆盖此方法定义实体类型
   */
  getEntityDomain() {
    throw new Error('Subclasses must implement getEntityDomain()');
  }

  /**
   * 生成UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 子类可以覆盖此方法获取额外配置选项
   */
  getExtraConfig(entity, index) {
    return null;
  }

  /**
   * 子类可以覆盖此方法处理额外配置变化
   */
  handleExtraConfigChange(entities, index, key, value) {
    entities[index][key] = value;
  }

  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : []
    };

    // 统一的默认值补充逻辑 + UUID自动生成
    const extraConfig = this.getExtraConfig({}, 0);
    this._config.entities = this._config.entities.map(e => {
      const enhanced = { ...e };
      
      // 如果没有UUID，自动生成一个
      if (!enhanced.uuid) {
        enhanced.uuid = this.generateUUID();
      }
      
      // 补充缺少的默认值
      if (extraConfig) {
        Object.entries(extraConfig).forEach(([key, config]) => {
          if (!(key in enhanced) && 'defaultValue' in config) {
            enhanced[key] = config.defaultValue;
          }
        });
      }
      return enhanced;
    });

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
    container.style.cssText = `
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    const entityContainer = document.createElement('div');
    entityContainer.id = 'entityContainer';
    entityContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 60px;
    `;

    this._config.entities.forEach((entity, index) => {
      const entityRow = this._createEntityRow(index, entity);
      entityContainer.appendChild(entityRow);
    });

    // 创建新增行
    const emptyRowData = { entity_id: '', uuid: this.generateUUID() };
    const extraConfig = this.getExtraConfig({}, 0);
    if (extraConfig) {
      Object.entries(extraConfig).forEach(([key, config]) => {
        if ('defaultValue' in config) {
          emptyRowData[key] = config.defaultValue;
        }
      });
    }

    const emptyRow = this._createEntityRow(
      this._config.entities.length,
      emptyRowData,
      true
    );
    entityContainer.appendChild(emptyRow);

    container.appendChild(entityContainer);
    this.appendChild(container);

    this._setupDragAndDrop(entityContainer);
  }

  _createEntityRow(index, entity, isNewRow = false) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0;
      border-radius: 6px;
      background-color: ${isNewRow ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
    `;

    wrapper.draggable = !isNewRow;
    wrapper.dataset.index = index;

    // 第一行：拖动图标 + 实体选择器 + 删除按钮
    const mainRow = document.createElement('div');
    mainRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      transition: background-color 0.2s;
    `;

    // 拖动图标
    if (!isNewRow) {
      mainRow.appendChild(this._createDragHandle());
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'width: 20px; flex-shrink: 0;';
      mainRow.appendChild(placeholder);
    }

    // 实体选择器（占据大部分空间）
    mainRow.appendChild(this._createEntitySelector(index, entity, isNewRow));

    // 展开/折叠按钮（仅限非新增行且有额外配置）
    const extraConfig = this.getExtraConfig(entity, index);
    if (!isNewRow && extraConfig) {
      const toggleBtn = this._createToggleButton(index, wrapper);
      mainRow.appendChild(toggleBtn);
    }

    // 删除按钮
    if (!isNewRow) {
      mainRow.appendChild(this._createDeleteButton(index));
    }

    wrapper.appendChild(mainRow);

    // 第二行：额外配置（折叠的）
    if (!isNewRow && extraConfig) {
      const detailRow = document.createElement('div');
      detailRow.style.cssText = `
        display: none;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        padding-top: 0;
        background-color: rgba(255, 255, 255, 0.02);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      `;
      detailRow.id = `details-${index}`;

      const controls = this._createExtraControls(index, entity, extraConfig, isNewRow);
      detailRow.appendChild(controls);
      wrapper.appendChild(detailRow);

      // 保存展开状态引用
      if (!this._expandedStates) {
        this._expandedStates = {};
      }
    }

    return wrapper;
  }

  _createToggleButton(index, wrapper) {
    const btn = document.createElement('button');
    btn.innerHTML = `
      <svg style="width: 20px; height: 20px; transition: transform 0.2s;" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
    `;
    btn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.2s;
      border-radius: 4px;
    `;

    btn.addEventListener('mouseover', () => btn.style.opacity = '0.9');
    btn.addEventListener('mouseout', () => btn.style.opacity = '0.6');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const detailsRow = wrapper.querySelector(`[id^="details-"]`);
      const isHidden = detailsRow.style.display === 'none';
      
      if (isHidden) {
        detailsRow.style.display = 'flex';
        btn.style.transform = 'rotate(180deg)';
      } else {
        detailsRow.style.display = 'none';
        btn.style.transform = 'rotate(0deg)';
      }
    });

    return btn;
  }

  _createDragHandle() {
    const handle = document.createElement('div');
    handle.innerHTML = `
      <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24">
        <path fill="currentColor" d="M9 3h2v2H9V3m0 4h2v2H9V7m0 4h2v2H9v-2m4-8h2v2h-2V3m0 4h2v2h-2V7m0 4h2v2h-2v-2z"/>
      </svg>
    `;
    handle.style.cssText = `
      cursor: move;
      flex-shrink: 0;
      opacity: 0.5;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
    `;
    handle.addEventListener('mouseover', () => handle.style.opacity = '0.8');
    handle.addEventListener('mouseout', () => handle.style.opacity = '0.5');
    return handle;
  }

  _createEntitySelector(index, entity, isNewRow) {
    const selector = document.createElement('ha-selector');
    selector.hass = this._hass;
    selector.selector = {
      entity: {
        filter: {
          domain: this.getEntityDomain()
        }
      }
    };
    selector.value = entity.entity_id || '';
    selector.style.cssText = `
      flex: 1;
      min-width: 200px;
    `;

    selector.addEventListener('value-changed', (e) => {
      const selectedValue = e.detail.value;

      if (isNewRow && selectedValue) {
        const newEntity = { 
          entity_id: selectedValue,
          uuid: this.generateUUID()
        };
        const extraConfig = this.getExtraConfig({}, 0);
        if (extraConfig) {
          Object.entries(extraConfig).forEach(([key, config]) => {
            if ('defaultValue' in config) {
              newEntity[key] = config.defaultValue;
            }
          });
        }
        this._config.entities.push(newEntity);
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        }));
        this.render();
      } else if (!isNewRow && selectedValue !== entity.entity_id) {
        const newEntities = [...this._config.entities];
        newEntities[index] = { ...newEntities[index], entity_id: selectedValue };
        this._config = { ...this._config, entities: newEntities };
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        }));
      }
    });

    return selector;
  }

  _createExtraControls(index, entity, extraConfig, isNewRow = false) {
    const controlsWrapper = document.createElement('div');
    controlsWrapper.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    `;

    Object.entries(extraConfig).forEach(([key, config]) => {
      const control = this._createControl(index, entity, key, config, isNewRow);
      controlsWrapper.appendChild(control);
    });

    return controlsWrapper;
  }

  _createControl(index, entity, key, config, isNewRow = false) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

    if (config.type === 'checkbox') {
      const label = document.createElement('label');
      label.textContent = config.label;
      label.style.cssText = 'user-select: none; font-size: 0.9em; font-weight: 500;';

      const checkboxWrapper = document.createElement('div');
      checkboxWrapper.style.cssText = 'display: flex; align-items: center;';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!entity[key];
      checkbox.style.cssText = 'cursor: pointer; margin-right: 8px;';

      checkbox.addEventListener('change', () => {
        const newEntities = [...this._config.entities];
        this.handleExtraConfigChange(newEntities, index, key, checkbox.checked);
        this._config = { ...this._config, entities: newEntities };
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        }));
      });

      checkboxWrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      wrapper.appendChild(checkboxWrapper);
    } else if (config.type === 'select' || config.type === 'card_type') {
      const label = document.createElement('label');
      label.textContent = config.label;
      label.style.cssText = 'user-select: none; font-size: 0.9em; font-weight: 500;';

      const select = document.createElement('select');
      select.style.cssText = `
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.9em;
        background-color: rgba(255, 255, 255, 0.05);
        color: inherit;
        cursor: pointer;
      `;

      config.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.text = option.label;
        opt.selected = entity[key] === option.value;
        select.appendChild(opt);
      });

      select.addEventListener('change', () => {
        const newEntities = [...this._config.entities];
        this.handleExtraConfigChange(newEntities, index, key, select.value);
        this._config = { ...this._config, entities: newEntities };
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        }));
      });

      wrapper.appendChild(label);
      wrapper.appendChild(select);
    } else if (config.type === 'entity') {
      // ✅ 新增：实体选择器（例如 remote / light / media_player...）
      const label = document.createElement('label');
      label.textContent = config.label;
      label.style.cssText = 'user-select: none; font-size: 0.9em; font-weight: 500;';

      const selector = document.createElement('ha-selector');
      selector.hass = this._hass;

      // domain 用 config.domain 指定；也允许你以后扩展用 config.filter
      selector.selector = {
        entity: {
          filter: config.filter ?? {
            domain: config.domain
          }
        }
      };

      selector.value = entity[key] || '';
      selector.style.cssText = `
        width: 100%;
        min-width: 200px;
      `;

      selector.addEventListener('value-changed', (e) => {
        const newVal = e.detail.value || '';
        const newEntities = [...this._config.entities];
        this.handleExtraConfigChange(newEntities, index, key, newVal);
        this._config = { ...this._config, entities: newEntities };
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        }));
      });

      wrapper.appendChild(label);
      wrapper.appendChild(selector);
    } else if (config.type === 'alias') {
      const label = document.createElement('label');
      label.textContent = config.label;
      label.style.cssText = 'user-select: none; font-size: 0.9em; font-weight: 500;';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = config.label;
      input.value = entity[key] || '';
      input.style.cssText = `
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.9em;
        background-color: rgba(255, 255, 255, 0.05);
        color: inherit;
      `;

      input.addEventListener('blur', () => {
        const newEntities = [...this._config.entities];
        this.handleExtraConfigChange(newEntities, index, key, input.value);
        this._config = { ...this._config, entities: newEntities };
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        }));
      });

      wrapper.appendChild(label);
      wrapper.appendChild(input);
    }

    return wrapper;
  }

  _createDeleteButton(index) {
    const btn = document.createElement('button');
    btn.innerHTML = `
      <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
      </svg>
    `;
    btn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.2s;
      border-radius: 4px;
    `;

    btn.addEventListener('mouseover', () => btn.style.opacity = '1');
    btn.addEventListener('mouseout', () => btn.style.opacity = '0.6');

    btn.addEventListener('click', () => {
      const newEntities = [...this._config.entities];
      newEntities.splice(index, 1);
      this._config = { ...this._config, entities: newEntities };
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      }));
      this.render();
    });

    return btn;
  }

  _setupDragAndDrop(container) {
    let draggedIndex = null;

    container.addEventListener('dragstart', (e) => {
      const target = e.target.closest('[draggable="true"]');
      if (target) {
        draggedIndex = parseInt(target.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
        target.style.opacity = '0.5';
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedIndex !== null) {
        const dropTarget = e.target.closest('[draggable="true"]');
        if (dropTarget) {
          const targetIndex = parseInt(dropTarget.dataset.index);
          if (!isNaN(targetIndex) && draggedIndex !== targetIndex) {
            const newEntities = [...this._config.entities];
            const [movedEntity] = newEntities.splice(draggedIndex, 1);
            newEntities.splice(targetIndex, 0, movedEntity);
            this._config = { ...this._config, entities: newEntities };
            this.dispatchEvent(new CustomEvent('config-changed', {
              detail: { config: this._config },
              bubbles: true,
              composed: true
            }));
            this.render();
          }
        }
        draggedIndex = null;
      }
    });

    container.addEventListener('dragend', (e) => {
      const draggables = container.querySelectorAll('[draggable="true"]');
      draggables.forEach(item => item.style.opacity = '1');
    });
  }
}