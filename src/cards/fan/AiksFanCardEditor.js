export class AiksFanCardEditor extends AiksControlBase {
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

    const nameLabel = document.createElement('label');
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '8px';
    nameLabel.innerText = '风扇名称:';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = this._config?.fan_name || '';
    nameInput.style.width = '100%';
    nameInput.style.padding = '8px';
    nameInput.style.boxSizing = 'border-box';
    nameInput.addEventListener('change', (e) => {
      this._config.fan_name = e.target.value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
    });

    container.appendChild(nameLabel);
    container.appendChild(nameInput);

    const entityContainer = document.createElement('div');
    entityContainer.style.marginTop = '16px';

    const entityTitle = document.createElement('h4');
    entityTitle.innerText = 'Fan Entities';
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
      select.innerHTML = '<option value="">Select Fan Entity</option>';

      Object.keys(this._hass?.states || {})
        .filter(id => id.startsWith('fan.'))
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

    const addBtn = this._createButton('Add Fan', () => {
      this._config.entities.push({ entity_id: '' });
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      this.render();
    });

    entityContainer.appendChild(addBtn);
    container.appendChild(entityContainer);
    this.appendChild(container);
  }
}