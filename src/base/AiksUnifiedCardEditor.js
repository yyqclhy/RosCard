import { AiksControlBase } from './AiksControlBase.js';

/**
 * 统一为一个灵活的基类
 * 通过配置项控制额外功能的开启和数据结构
 */
export class AiksUnifiedCardEditor extends AiksControlBase {
  /**
   * 子类必须覆盖此方法定义实体类型
   */
  getEntityDomain() {
    throw new Error('Subclasses must implement getEntityDomain()');
  }

  /**
   * 子类可以覆盖此方法获取额外配置选项
   * @returns {Object|null} 额外配置对象，结构如:
   * {
   *   fieldName: {
   *     type: 'checkbox' | 'select',
   *     label: '标签',
   *     defaultValue: value,  // 新增：用于自动填充默认值
   *     options: [...] // 仅 select 类型需要
   *   }
   * }
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

    // 统一的默认值补充逻辑
    const extraConfig = this.getExtraConfig({}, 0);
    if (extraConfig) {
      this._config.entities = this._config.entities.map(e => {
        const enhanced = { ...e };
        Object.entries(extraConfig).forEach(([key, config]) => {
          if (!(key in enhanced) && 'defaultValue' in config) {
            enhanced[key] = config.defaultValue;
          }
        });
        return enhanced;
      });
    }

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

    // 创建新增行模板
    const emptyRowData = { entity_id: '' };
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
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      background-color: ${isNewRow ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: background-color 0.2s;
    `;

    wrapper.draggable = !isNewRow;
    wrapper.dataset.index = index;

    // 拖动图标
    if (!isNewRow) {
      wrapper.appendChild(this._createDragHandle());
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'width: 20px; flex-shrink: 0;';
      wrapper.appendChild(placeholder);
    }

    // 实体选择器
    wrapper.appendChild(this._createEntitySelector(index, entity, isNewRow));

    // 额外配置（仅限非新增行）
    if (!isNewRow) {
      const extraConfig = this.getExtraConfig(entity, index);
      if (extraConfig) {
        wrapper.appendChild(this._createExtraControls(index, entity, extraConfig));
      }
    }

    // 删除按钮（仅限非新增行）
    if (!isNewRow) {
      wrapper.appendChild(this._createDeleteButton(index));
    }

    return wrapper;
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
        const newEntity = { entity_id: selectedValue };
        // 补充默认值
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

  _createExtraControls(index, entity, extraConfig) {
    const controlsWrapper = document.createElement('div');
    controlsWrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    `;

    Object.entries(extraConfig).forEach(([key, config]) => {
      const control = this._createControl(index, entity, key, config);
      controlsWrapper.appendChild(control);
    });

    return controlsWrapper;
  }

  _createControl(index, entity, key, config) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; align-items: center; gap: 6px;';

    if (config.type === 'checkbox') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!entity[key];

      const label = document.createElement('label');
      label.textContent = config.label;
      label.style.cssText = 'user-select: none; cursor: pointer; font-size: 0.9em;';

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

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
    } else if (config.type === 'select') {
      const select = document.createElement('select');
      select.style.cssText = 'padding: 4px; border-radius: 4px; font-size: 0.9em;';

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

      wrapper.appendChild(select);
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