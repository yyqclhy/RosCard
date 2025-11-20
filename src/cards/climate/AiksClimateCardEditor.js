import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksClimateCardEditor extends AiksControlBase {
setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : []
    };
      // ✅ 为每个实体补默认值：不独立显示
  this._config.entities = this._config.entities.map(e => ({
    ...e,
    independent_display: e.independent_display === true // 只接受严格 true
      ? true
      : false
  }));
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
        // 首次渲染时才加载图片和其他资源
    if (this.firstRender) {
      this.render();
      this.firstRender = false;  // 标记首次渲染已完成
    }
  }

  render() {
    if (!this._config || !this._hass) return;
    this.innerHTML = '';

    const container = document.createElement('div');
    container.style.padding = '16px';

    const entityContainer = document.createElement('div');
    entityContainer.id = 'entityContainer';
    entityContainer.style.minHeight = '100px';

    this._config.entities.forEach((entity, index) => {
      const entityWrapper = this._createEntityRow(index, entity);
      entityContainer.appendChild(entityWrapper);
    });

    const addButton = this._createButton(this._language === 'zh' ? '添加气候设备' : 'Add Climate Device', () => {
      this._config.entities.push({ entity_id: '' });
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
      this.render();
    });
    container.appendChild(entityContainer);
    container.appendChild(addButton);

    this.appendChild(container);
    this._setupDragAndDrop(entityContainer);
  }

  _createEntityRow(index, entity) {
    const entityWrapper = document.createElement('div');
    entityWrapper.style.marginBottom = '10px';
    entityWrapper.style.display = 'flex';
    entityWrapper.style.alignItems = 'center';
    entityWrapper.draggable = true;
    entityWrapper.dataset.index = index;
    entityWrapper.style.cursor = 'move';

    const entityLabel = document.createElement('span');
    entityLabel.innerText = this._translations[this._language].selectEntity + ': ';
    entityLabel.style.width = '100px';
    entityWrapper.appendChild(entityLabel);

    const entitySelect = document.createElement('select');
    entitySelect.style.width = '250px';
    entitySelect.innerHTML = `<option value="">${this._translations[this._language].selectEntity}</option>`;
    Object.keys(this._hass.states).forEach(entityId => {
      if (entityId.startsWith('climate.')) {
        const option = document.createElement('option');
        option.value = entityId;
        const friendlyName = this._hass.states[entityId]?.attributes?.friendly_name || entityId;
        option.text = `${friendlyName} (${entityId})`;
        if (entityId === entity.entity_id) option.selected = true;
        entitySelect.appendChild(option);
      }
    });
    entitySelect.addEventListener('change', () => {
      const newEntities = [...this._config.entities];
      newEntities[index] = { ...newEntities[index], entity_id: entitySelect.value };
      this._config = { ...this._config, entities: newEntities };
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
      this.render();
    });
    entityWrapper.appendChild(entitySelect);


        // 在 entityWrapper.appendChild(entitySelect); 之后，deleteButton 之前，加：
    const soloWrapper = document.createElement('label');
    soloWrapper.style.marginLeft = '10px';
    soloWrapper.style.display = 'inline-flex';
    soloWrapper.style.alignItems = 'center';
    soloWrapper.style.gap = '6px';

    const soloCheckbox = document.createElement('input');
    soloCheckbox.type = 'checkbox';
    soloCheckbox.checked = !!entity.independent_display;

    const soloText = document.createElement('span');
    soloText.textContent = this._translations[this._language].independentDisplay;

    soloWrapper.appendChild(soloCheckbox);
    soloWrapper.appendChild(soloText);
    entityWrapper.appendChild(soloWrapper);

    soloCheckbox.addEventListener('change', () => {
      const newEntities = [...this._config.entities];
      newEntities[index] = {
        ...newEntities[index],
        independent_display: soloCheckbox.checked
      };
      this._config = { ...this._config, entities: newEntities };
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: { ...this._config } }
      }));
    });

    const deleteButton = this._createButton(this._language === 'zh' ? '删除' : 'Delete', () => {
      const newEntities = [...this._config.entities];
      newEntities.splice(index, 1);
      this._config = { ...this._config, entities: newEntities };
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
      this.render();
    });
    entityWrapper.appendChild(deleteButton);

    return entityWrapper;
  }

  _setupDragAndDrop(container) {
    let draggedIndex = null;

    container.addEventListener('dragstart', (e) => {
      const target = e.target;
      if (target.draggable) {
        draggedIndex = parseInt(target.dataset.index);
        e.dataTransfer.setData('text/plain', draggedIndex);
        target.style.opacity = '0.5';
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedIndex !== null) {
        const targetIndex = parseInt(e.target.dataset.index);
        if (!isNaN(targetIndex) && draggedIndex !== targetIndex) {
          const newEntities = [...this._config.entities];
          const [movedEntity] = newEntities.splice(draggedIndex, 1);
          newEntities.splice(targetIndex, 0, movedEntity);
          this._config = { ...this._config, entities: newEntities };
          this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
          this.render();
        }
        draggedIndex = null;
        const draggables = container.querySelectorAll('[draggable]');
        draggables.forEach(item => item.style.opacity = '1');
      }
    });

    container.addEventListener('dragend', (e) => {
      if (draggedIndex !== null) {
        const draggables = container.querySelectorAll('[draggable]');
        draggables.forEach(item => item.style.opacity = '1');
      }
    });
  }
  
}