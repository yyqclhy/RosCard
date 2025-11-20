import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksLightMonitorCardEditor extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      lights: Array.isArray(config?.lights) ? [...config.lights] : []
    };
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

    // 标题
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      color: #333;
    `;
    title.textContent = this._language === 'zh' ? '监听的灯' : 'Monitored Lights';
    container.appendChild(title);

    // 灯列表容器
    const lightContainer = document.createElement('div');
    lightContainer.id = 'lightContainer';
    lightContainer.style.minHeight = '100px';

    this._config.lights.forEach((lightId, index) => {
      const lightWrapper = this._createLightRow(index, lightId);
      lightContainer.appendChild(lightWrapper);
    });

    // 添加灯按钮
    const addButton = this._createButton(
      this._language === 'zh' ? '添加灯' : 'Add Light',
      () => {
        this._config.lights.push('');
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        }));
        this.render();
      }
    );
    addButton.style.width = '100%';

    container.appendChild(lightContainer);
    container.appendChild(addButton);

    this.appendChild(container);

    this._setupDragAndDrop(lightContainer);
  }

_createLightRow(index, lightId) {
  const lightWrapper = document.createElement('div');
  lightWrapper.style.cssText = `
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: move;
    padding: 8px;
    background: #333131ff;
    border-radius: 4px;
    border-left: 3px solid #03a9f4;
  `;
  lightWrapper.draggable = true;
  lightWrapper.dataset.index = index;

  // 拖拽手柄
  const dragHandle = document.createElement('span');
  dragHandle.style.cssText = `
    color: #999;
    cursor: move;
    font-size: 18px;
  `;
  dragHandle.textContent = '≡';
  lightWrapper.appendChild(dragHandle);

  // ⭐ 中部容器：标签 + 下拉框 + 删除按钮
  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    max-width: 480px;   /* 整体中间这块的最大宽度，想更短就调小 */
  `;

  // 标签
  const lightLabel = document.createElement('span');
  lightLabel.innerText = this._language === 'zh' ? '灯: ' : 'Light: ';
  lightLabel.style.minWidth = '40px';
  lightLabel.style.fontSize = '13px';

  // 下拉选择灯实体（稍微短一点）
  const lightSelect = document.createElement('select');
  lightSelect.style.cssText = `
    flex: 1;
    min-width: 140px;
    max-width: 260px;   /* 下拉框最大宽度，想更短就改这里 */
    padding: 6px 8px;
    border: 1px solid #333131ff;
    border-radius: 3px;
    font-size: 13px;
    background: #333131ff;
  `;

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.text = this._language === 'zh' ? '选择灯...' : 'Select Light...';
  lightSelect.appendChild(defaultOption);

  Object.keys(this._hass.states).forEach(entityId => {
    if (entityId.startsWith('light.')) {
      const option = document.createElement('option');
      option.value = entityId;
      const friendlyName =
        this._hass.states[entityId]?.attributes?.friendly_name || entityId;
      option.text = `${friendlyName} (${entityId})`;
      if (entityId === lightId) option.selected = true;
      lightSelect.appendChild(option);
    }
  });

  lightSelect.addEventListener('change', () => {
    const newLights = [...this._config.lights];
    newLights[index] = lightSelect.value;
    this._config = { ...this._config, lights: newLights };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
      bubbles: true,
      composed: true
    }));
    this.render();
  });

  // 删除按钮（紧挨在下拉框右边）
  const deleteButton = this._createButton(
    this._language === 'zh' ? '删除' : 'Delete',
    () => {
      const newLights = [...this._config.lights];
      newLights.splice(index, 1);
      this._config = { ...this._config, lights: newLights };
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: { ...this._config } },
        bubbles: true,
        composed: true
      }));
      this.render();
    }
  );
  deleteButton.style.cssText = `
    padding: 6px 12px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
  `;

  // 组装中间部分
  inputWrapper.appendChild(lightLabel);
  inputWrapper.appendChild(lightSelect);
  inputWrapper.appendChild(deleteButton);

  lightWrapper.appendChild(inputWrapper);

  return lightWrapper;
}





  _setupDragAndDrop(container) {
    let draggedIndex = null;

    container.addEventListener('dragstart', (e) => {
      const target = e.target.closest('[draggable]');
      if (target) {
        draggedIndex = parseInt(target.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedIndex);
        target.style.opacity = '0.5';
        target.style.background = '#333131ff;';
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    container.addEventListener('dragenter', (e) => {
      const target = e.target.closest('[draggable]');
      if (target && draggedIndex !== null) {
        target.style.borderTop = '2px solid #03a9f4';
      }
    });

    container.addEventListener('dragleave', (e) => {
      const target = e.target.closest('[draggable]');
      if (target) {
        target.style.borderTop = 'none';
      }
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('[draggable]');
      if (target && draggedIndex !== null) {
        const targetIndex = parseInt(target.dataset.index);
        if (!isNaN(targetIndex) && draggedIndex !== targetIndex) {
          const newLights = [...this._config.lights];
          const [movedLight] = newLights.splice(draggedIndex, 1);
          newLights.splice(targetIndex, 0, movedLight);
          this._config = { ...this._config, lights: newLights };
          this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: { ...this._config } },
            bubbles: true,
            composed: true
          }));
          this.render();
        }
      }
    });

    container.addEventListener('dragend', (e) => {
      const target = e.target.closest('[draggable]');
      if (target) {
        target.style.opacity = '1';
        target.style.background = '#333131ff;';
        target.style.borderTop = 'none';
      }
      draggedIndex = null;
    });
  }
}