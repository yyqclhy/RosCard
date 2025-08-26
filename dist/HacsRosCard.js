class AiksControlBase extends HTMLElement {
  constructor() {
    super();
    this.firstRender = true;  // 新增标志，表示是否是首次渲染
    this._language = navigator.language.startsWith('zh') ? 'zh' : 'en';
    this._translations = {
      zh: {
        cardTitle: (name) => `${name || '未命名设备'} 卡片`,
        controlPanelTitle: '发送控制命令',
        sendButton: '发送',
        testButton: '测试',
        nameLabel: '设备名称: ',
        selectEntity: '请选择实体',
        selectCommand: '请选择命令',
        selectOption: '请选择选项',
        enterCommand: '请输入命令值...',
        clearButton: '清空',
        validEntity: '请选择有效实体',
        stateOn: '开',
        stateOff: '关',
        defaultIconPath: '/local/aiks-card/icon_img/states_device_light_on_icon.png', // 默认图标路径
        entity: '实体',
        executionModes: {
          immediate: '立即执行',
          delayed: '延迟执行',
          popup: '弹窗询问'
        },
        independentDisplay: '是否独立显示',
        yes: '是',
        no: '否',
      },
      en: {
        cardTitle: (name) => `${name || 'Unnamed Device'} Card`,
        controlPanelTitle: 'Send Control Commands',
        sendButton: 'Send',
        testButton: 'Test',
        nameLabel: 'Device Name: ',
        selectEntity: 'Please select an entity',
        selectCommand: 'Please select a command',
        selectOption: 'Please select an option',
        enterCommand: 'Enter command value...',
        clearButton: 'Clear',
        validEntity: 'Please select a valid entity',
        stateOn: 'On',
        stateOff: 'Off',
        defaultIconPath: '/local/aiks-card/icon_img/states_device_light_on_icon.png', // 默认图标路径
        entity: 'Entity',
          executionModes: {
          immediate: 'Immediate',
          delayed: 'Delayed',
          popup: 'Popup Ask'
           },
        independentDisplay: 'Show independently',
        yes: 'Yes',
        no: 'No',
      }
    };

  }

  _createButton(label, handler) {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.style.margin = '4px';
    btn.onclick = handler.bind(this);
    return btn;
  }
  // 新增方法：创建图片元素
  _createIcon(iconPath) {
    const icon = document.createElement('img');

    const ts = new Date().getTime();  // 当前时间戳
    //当更改了图片内容但文件名未变，浏览器会以为它还是旧的资源，直接使用本地缓存，而不重新加载最新版本。
    //所以这里加时间戳
    //注：在开发环境使用时间戳，生产环境还是修改文件名好，特别是更新用户的资源时
    icon.src = `${iconPath || this._translations[this._language].defaultIconPath}?t=${ts}`; 
    // icon.src = iconPath || this._translations[this._language].defaultIconPath;
    icon.style.position = 'absolute';
    icon.style.top = '50px';
    icon.style.right = '30px';
    icon.style.width = '60px';
    icon.style.height = '60px';
    return icon;
  }
}

class AiksTvCard extends AiksControlBase {
  constructor() {
    super();
    this._translations = {
      ...this._translations,
      zh: {
        ...this._translations.zh,
        mediaCommands: [
          { label: '播放', value: 'media_play' },
          { label: '暂停', value: 'media_pause' },
          { label: '音量增加', value: 'volume_up' },
          { label: '音量减少', value: 'volume_down' },
          { label: '静音', value: 'volume_mute_true' },
          { label: '取消静音', value: 'volume_mute_false' }
        ]
      },
      en: {
        ...this._translations.en,
        mediaCommands: [
          { label: 'Play', value: 'media_play' },
          { label: 'Pause', value: 'media_pause' },
          { label: 'Volume Up', value: 'volume_up' },
          { label: 'Volume Down', value: 'volume_down' },
          { label: 'Mute', value: 'volume_mute_true' },
          { label: 'Unmute', value: 'volume_mute_false' }
        ]
      }
    };
    this.addEventListener('config-changed', (e) => {
      this.setConfig(e.detail.config);
    });
  }

  setConfig(config) {
    this._config = { 
      ...config, 
      tv_name: config.tv_name || (this._language === 'zh' ? '未命名电视' : 'Unnamed TV'),
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_tv.png' // 自定义图标路径 
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
    if (!this._hass) return;

    this.innerHTML = '';

    const card = document.createElement('ha-card');
    card.header = this._translations[this._language].cardTitle(this._config.tv_name);

    // 添加图片
    card.appendChild(this._createIcon(this._config.icon_path));

    const controlPanel = document.createElement('div');
    controlPanel.style.padding = '16px';
    controlPanel.style.position = 'relative';
    controlPanel.innerHTML = `<h3>${this._translations[this._language].controlPanelTitle}</h3>`;

    if (Array.isArray(this._config.entities) && this._config.entities.length > 0) {
      this._config.entities.forEach((config) => {
        if (config.type === 'media_player' && config.commands) {
          Object.entries(config.commands).forEach(([command, service]) => {
            const cmdWrapper = document.createElement('div');
            cmdWrapper.innerHTML = `<span>${config.entity_id}: ${command}</span>`;
            const sendButton = this._createButton(this._translations[this._language].sendButton, () => {
              if (service === 'volume_mute') {
                this._hass.callService(config.type, service, { 
                  entity_id: config.entity_id, 
                  is_volume_muted: command.includes('静音') || command.includes('Mute') ? true : false 
                });
              } else {
                this._hass.callService(config.type, service, { entity_id: config.entity_id });
              }
            });
            cmdWrapper.appendChild(sendButton);
            controlPanel.appendChild(cmdWrapper);
          });
        } else if (config.type === 'remote' && config.commands) {
          Object.entries(config.commands).forEach(([command, value]) => {
            const cmdWrapper = document.createElement('div');
            cmdWrapper.innerHTML = `<span>${config.entity_id}: ${command} = ${value}</span>`;
            const sendButton = this._createButton(this._translations[this._language].testButton, () => {
              this._hass.callService(config.type, 'send_command', { entity_id: config.entity_id, command: value });
            });
            cmdWrapper.appendChild(sendButton);
            controlPanel.appendChild(cmdWrapper);
          });
        } else if (config.type === 'select' && config.commands) {
          Object.entries(config.commands).forEach(([command, value]) => {
            const cmdWrapper = document.createElement('div');
            cmdWrapper.innerHTML = `<span>${config.entity_id}: ${command} = ${value}</span>`;
            const sendButton = this._createButton(this._translations[this._language].testButton, () => {
              this._hass.callService(config.type, 'select_option', { entity_id: config.entity_id, option: value });
            });
            cmdWrapper.appendChild(sendButton);
            controlPanel.appendChild(cmdWrapper);
          });
        }
      });
    }

    card.appendChild(controlPanel);
    this.appendChild(card);
  }

  static async getConfigElement() {
    return document.createElement('aiks-tv-card-editor');
  }

  static getStubConfig() {
    const language = navigator.language.startsWith('zh') ? 'zh' : 'en';
    return {
      tv_name: language === 'zh' ? '未命名电视' : 'Unnamed TV',
      entities: []
    };
  }
}

class AiksTvCardEditor extends AiksControlBase {
  constructor() {
    super();
    this._translations = {
      ...this._translations,
      zh: {
        ...this._translations.zh,
        mediaCommands: [
          { label: '播放', value: 'media_play' },
          { label: '暂停', value: 'media_pause' },
          { label: '音量增加', value: 'volume_up' },
          { label: '音量减少', value: 'volume_down' },
          { label: '静音', value: 'volume_mute_true' },
          { label: '取消静音', value: 'volume_mute_false' }
        ]
      },
      en: {
        ...this._translations.en,
        mediaCommands: [
          { label: 'Play', value: 'media_play' },
          { label: 'Pause', value: 'media_pause' },
          { label: 'Volume Up', value: 'volume_up' },
          { label: 'Volume Down', value: 'volume_down' },
          { label: 'Mute', value: 'volume_mute_true' },
          { label: 'Unmute', value: 'volume_mute_false' }
        ]
      }
    };
  }

    //获取uuid
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  setConfig(config) {

    // 添加 UUID 生成逻辑（只在首次配置时执行）
    const newConfig = { ...config };

    if (!newConfig.id) {
      newConfig.id = this.generateUUID(); // 只在第一次赋值
    }
    this._config = {
      ...newConfig,
      id: newConfig.id, // ✅ 确保显式包含 id 字段
      tv_name: newConfig.tv_name || defaultName,
      entities: Array.isArray(newConfig?.entities) ? [...newConfig.entities] : []
    };


      // 确保 uuid 被包含在最终配置中
    this.dispatchEvent(new CustomEvent('config-changed', { 
      detail: { 
      config: {
        ...this._config 
      }
    }
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

    const tvNameWrapper = document.createElement('div');
    tvNameWrapper.style.marginBottom = '10px';
    tvNameWrapper.style.display = 'flex';
    tvNameWrapper.style.alignItems = 'center';

    const tvNameLabel = document.createElement('span');
    tvNameLabel.innerText = this._translations[this._language].nameLabel;
    tvNameLabel.style.width = '100px';
    tvNameWrapper.appendChild(tvNameLabel);

    const tvNameInput = document.createElement('input');
    tvNameInput.type = 'text';
    tvNameInput.value = this._config.tv_name || (this._language === 'zh' ? '未命名电视' : 'Unnamed TV');
    tvNameInput.style.width = '200px';
    tvNameInput.style.marginRight = '10px';
    tvNameInput.addEventListener('blur', () => {
      if (this._config.tv_name !== tvNameInput.value) {
        this._config.tv_name = tvNameInput.value;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      }
    });
    tvNameWrapper.appendChild(tvNameInput);

    container.appendChild(tvNameWrapper);

    const entityContainer = document.createElement('div');
    entityContainer.id = 'entityContainer';
    const predefinedKeys = [
      'POWER', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'BACK',
      'PLAY', 'PAUSE', 'VOLUME_UP', 'VOLUME_DOWN', 'MUTE','UN_MUTE',
      'SETTINGS', 'HOME', 'MENU'
    ];

    this._config.entities = predefinedKeys.map((key, index) => {
      return this._config.entities[index] || { key, type: '', entity_id: '', value: '' };
    });

    this._config.entities.forEach((config, index) => {
      const entityWrapper = this._createEntityRow(index, config, this._hass);
      entityContainer.appendChild(entityWrapper);
    });

    container.appendChild(entityContainer);
    this.appendChild(container);
  }

  _createEntityRow(index, config, hass) {
    const entityWrapper = document.createElement('div');
    entityWrapper.style.marginBottom = '10px';
    entityWrapper.style.display = 'flex';
    entityWrapper.style.alignItems = 'center';

    const keyLabel = document.createElement('span');
    keyLabel.innerText = `${config.key}: `;
    keyLabel.style.width = '100px';
    entityWrapper.appendChild(keyLabel);

    const entitySelect = document.createElement('select');
    entitySelect.style.width = '200px';
    entitySelect.style.textOverflow = 'ellipsis';
    entitySelect.style.overflow = 'hidden';
    entitySelect.style.whiteSpace = 'nowrap';
    entitySelect.innerHTML = `<option value="">${this._translations[this._language].selectEntity}</option>`;
    const entities = hass.states;
    Object.keys(entities).forEach(entity => {
      if (entity.startsWith('media_player.') || entity.startsWith('remote.') || entity.startsWith('select.')) {
        const option = document.createElement('option');
        option.value = entity;
        const friendlyName = hass.states[entity]?.attributes?.friendly_name || entity;
        option.text = `${friendlyName} (${entity})`;
        if (entity === config.entity_id) option.selected = true;
        entitySelect.appendChild(option);
      }
    });

    const componentContainer = document.createElement('div');
    componentContainer.style.marginLeft = '10px';

    entityWrapper.appendChild(entitySelect);
    entityWrapper.appendChild(componentContainer);

    const updateConfig = () => {
      const newEntityId = entitySelect.value;
      const newType = newEntityId ? newEntityId.split('.')[0] : '';
      const newValue = componentContainer.querySelector('select')?.value || componentContainer.querySelector('input')?.value || config.value || '';

      const newConfig = { key: config.key, type: newType, entity_id: newEntityId, value: newValue };
      const newEntities = [...this._config.entities];
      newEntities[index] = newConfig;
      this._config.entities = newEntities;
      this._config.tv_name = this._config.tv_name || (this._language === 'zh' ? '未命名电视' : 'Unnamed TV');
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
    };

    const updateComponent = () => {
      componentContainer.innerHTML = '';
      const entityId = entitySelect.value;
      const type = entityId ? entityId.split('.')[0] : '';

      if (entityId && entitySelect.selectedIndex >= 0) {
        const friendlyName = hass.states[entityId]?.attributes?.friendly_name || entityId;
        entitySelect.options[entitySelect.selectedIndex].text = friendlyName;
      }

      let inputElement = null;

      if (type === 'media_player') {
        const commandSelect = document.createElement('select');
        commandSelect.style.width = '200px';
        commandSelect.style.textOverflow = 'ellipsis';
        commandSelect.style.overflow = 'hidden';
        commandSelect.style.whiteSpace = 'nowrap';
        commandSelect.innerHTML = `<option value="">${this._translations[this._language].selectCommand}</option>`;
        this._translations[this._language].mediaCommands.forEach(cmd => {
          const option = document.createElement('option');
          option.value = cmd.value;
          option.text = cmd.label;
          if (cmd.value === config.value) option.selected = true;
          commandSelect.appendChild(option);
        });
        commandSelect.addEventListener('change', updateConfig);
        componentContainer.appendChild(commandSelect);
        inputElement = commandSelect;
      } else if (type === 'select' && hass.states[entityId]?.attributes?.options) {
        const optionSelect = document.createElement('select');
        optionSelect.style.width = '200px';
        optionSelect.style.textOverflow = 'ellipsis';
        optionSelect.style.overflow = 'hidden';
        optionSelect.style.whiteSpace = 'nowrap';
        optionSelect.innerHTML = `<option value="">${this._translations[this._language].selectOption}</option>`;
        hass.states[entityId].attributes.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.text = opt;
          if (opt === config.value) option.selected = true;
          optionSelect.appendChild(option);
        });
        optionSelect.addEventListener('change', updateConfig);
        componentContainer.appendChild(optionSelect);
        inputElement = optionSelect;
      } else if (type === 'remote') {
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.value = config.value || '';
        valueInput.placeholder = this._translations[this._language].enterCommand;
        valueInput.style.marginRight = '10px';
        valueInput.style.width = '200px';
        valueInput.addEventListener('blur', () => {
          if (config.value !== valueInput.value) {
            updateConfig();
          }
        });
        componentContainer.appendChild(valueInput);
        inputElement = valueInput;
      } else {
        componentContainer.innerHTML = `<span>${this._translations[this._language].validEntity}</span>`;
      }

      if (inputElement) {
        const sendButton = this._createButton(this._translations[this._language].sendButton, () => {
          if (type === 'media_player') {
            const service = inputElement?.value || config.value;
            if (service.startsWith('volume_mute_')) {
              const isMuted = service === 'volume_mute_true';
              hass.callService('media_player', 'volume_mute', { entity_id: entityId, is_volume_muted: isMuted });
            } else {
              hass.callService('media_player', service, { entity_id: entityId });
            }
          } else if (type === 'remote') {
            hass.callService('remote', 'send_command', { entity_id: entityId, command: inputElement?.value || config.value });
          } else if (type === 'select') {
            hass.callService('select', 'select_option', { entity_id: entityId, option: inputElement?.value || config.value });
          }
          updateConfig();
        });
        componentContainer.appendChild(sendButton);

        const clearButton = this._createButton(this._translations[this._language].clearButton, () => {
          entitySelect.value = '';
          componentContainer.innerHTML = `<span>${this._translations[this._language].validEntity}</span>`;
          const newConfig = { key: config.key, type: '', entity_id: '', value: '' };
          const newEntities = [...this._config.entities];
          newEntities[index] = newConfig;
          this._config.entities = newEntities;
          this._config.tv_name = this._config.tv_name || (this._language === 'zh' ? '未命名电视' : 'Unnamed TV');
          this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
        });
        componentContainer.appendChild(clearButton);
      }
    };

    entitySelect.addEventListener('change', updateComponent);

    if (config.entity_id) {
      entitySelect.value = config.entity_id;
      updateComponent();
    }

    return entityWrapper;
  }


}

class AiksLightCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_light.png' // 自定义图标路径
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '灯光控制' : 'Light Control');

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
    return document.createElement('aiks-light-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksLightCardEditor extends AiksControlBase {
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

    const addButton = this._createButton(this._language === 'zh' ? '添加设备' : 'Add Device', () => {
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
      if (entityId.startsWith('light.')) {
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

class AiksFanCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_fan.png' // 自定义图标路径
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '风扇控制' : 'Fan Control');

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
    return document.createElement('aiks-fan-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksFanCardEditor extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : []
    };
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

    const addButton = this._createButton(this._language === 'zh' ? '添加设备' : 'Add Device', () => {
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
      if (entityId.startsWith('fan.')) {
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

// Scene Card
class AiksSceneCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_scene.png' // 自定义图标路径
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '场景控制' : 'Scene Control');

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
    return document.createElement('aiks-scene-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksSceneCardEditor extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : []
    };

    // ✅ 在这里补充默认值（mode）
    this._config.entities = this._config.entities.map(e => ({
    ...e,
    mode: e.mode || 'immediate'
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

      const modeSelect = document.createElement('select');
      modeSelect.style.marginLeft = '10px';
      modeSelect.style.width = '150px';

      ['immediate', 'delayed', 'popup'].forEach((modeOption) => {
        const option = document.createElement('option');
        option.value = modeOption;
        option.text = this._translations[this._language].executionModes[modeOption];

        if ((entity.mode || 'immediate') === modeOption) {
          option.selected = true;
        }
        modeSelect.appendChild(option);
      });

      modeSelect.addEventListener('change', () => {
        const newEntities = [...this._config.entities];
        newEntities[index] = {
          ...newEntities[index],
          mode: modeSelect.value
        };
        this._config = { ...this._config, entities: newEntities };
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: { ...this._config } }
        }));
      });
      entityContainer.appendChild(entityWrapper);
    });

    const addButton = this._createButton(this._language === 'zh' ? '添加场景' : 'Add Scene', () => {
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
    entitySelect.style.width = '200px';
    entitySelect.innerHTML = `<option value="">${this._translations[this._language].selectEntity}</option>`;
    Object.keys(this._hass.states).forEach(entityId => {
      if (entityId.startsWith('scene.')) {
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


    // ✅ 执行方式选择框
  const modeSelect = document.createElement('select');
  modeSelect.style.marginLeft = '10px';
  modeSelect.style.width = '100px';

  ['immediate', 'delayed', 'popup'].forEach((modeOption) => {
    const option = document.createElement('option');
    option.value = modeOption;
    option.text = this._language === 'zh'
      ? (modeOption === 'immediate' ? '立即执行' :
         modeOption === 'delayed' ? '延迟执行' : '弹窗询问')
      : (modeOption === 'immediate' ? 'Immediate' :
         modeOption === 'delayed' ? 'Delayed' : 'Popup Ask');
    if ((entity.mode || 'immediate') === modeOption) {
      option.selected = true;
    }
    modeSelect.appendChild(option);
  });

  modeSelect.addEventListener('change', () => {
    const newEntities = [...this._config.entities];
    newEntities[index] = { ...newEntities[index], mode: modeSelect.value };
    this._config = { ...this._config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
  });
  entityWrapper.appendChild(modeSelect);

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

// Media Player Card
class AiksMediaPlayerCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_media_play1.png' // 自定义图标路径
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '媒体播放器控制' : 'Media Player Control');

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
    return document.createElement('aiks-media-player-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksMediaPlayerCardEditor extends AiksControlBase {
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

    const addButton = this._createButton(this._language === 'zh' ? '添加媒体播放器' : 'Add Media Player', () => {
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
      if (entityId.startsWith('media_player.')) {
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

// Climate Card
class AiksClimateCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_climate.png' // 自定义图标路径
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '气候控制' : 'Climate Control');

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
    return document.createElement('aiks-climate-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksClimateCardEditor extends AiksControlBase {
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

// Cover Card
class AiksCoverCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_cover.png' // 自定义图标路径
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '窗帘控制' : 'Cover Control');

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
    return document.createElement('aiks-cover-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksCoverCardEditor extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : []
    };
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

    const addButton = this._createButton(this._language === 'zh' ? '添加窗帘设备' : 'Add Cover Device', () => {
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
      if (entityId.startsWith('cover.')) {
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

// Weather Card
class AiksWeatherCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_weather.png'
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '天气控制' : 'Weather Control');

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
    return document.createElement('aiks-weather-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksWeatherCardEditor extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : []
    };
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

    const addButton = this._createButton(this._language === 'zh' ? '添加天气实体' : 'Add Weather Entity', () => {
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
      if (entityId.startsWith('weather.')) {
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

// Switch Card
class AiksSwitchCard extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : [],
      icon_path: config.icon_path || '/local/aiks-card/icon_img/icon_switch.png' // 自定义图标路径
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
    card.header = this._translations[this._language].cardTitle(this._language === 'zh' ? '开关控制' : 'Switch Control');

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
    return document.createElement('aiks-switch-card-editor');
  }

  static getStubConfig() {
    return { entities: [] };
  }
}

class AiksSwitchCardEditor extends AiksControlBase {
  setConfig(config) {
    this._config = {
      ...config,
      entities: Array.isArray(config?.entities) ? [...config.entities] : []
    };
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

    const addButton = this._createButton(this._language === 'zh' ? '添加开关设备' : 'Add Switch Device', () => {
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
      if (entityId.startsWith('switch.')) {
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



// 注册自定义卡片
customElements.define('aiks-tv-card', AiksTvCard);
customElements.define('aiks-tv-card-editor', AiksTvCardEditor);
customElements.define('aiks-light-card', AiksLightCard);
customElements.define('aiks-light-card-editor', AiksLightCardEditor);
customElements.define('aiks-fan-card', AiksFanCard);
customElements.define('aiks-fan-card-editor', AiksFanCardEditor);
customElements.define('aiks-scene-card', AiksSceneCard);
customElements.define('aiks-scene-card-editor', AiksSceneCardEditor);
customElements.define('aiks-media-player-card', AiksMediaPlayerCard);
customElements.define('aiks-media-player-card-editor', AiksMediaPlayerCardEditor);
customElements.define('aiks-climate-card', AiksClimateCard);
customElements.define('aiks-climate-card-editor', AiksClimateCardEditor);
customElements.define('aiks-cover-card', AiksCoverCard);
customElements.define('aiks-cover-card-editor', AiksCoverCardEditor);
customElements.define('aiks-switch-card', AiksSwitchCard);
customElements.define('aiks-switch-card-editor', AiksSwitchCardEditor);
customElements.define('aiks-weather-card', AiksWeatherCard);
customElements.define('aiks-weather-card-editor', AiksWeatherCardEditor);

window.customCards = window.customCards || [];
window.customCards.push(
   {
    type: 'aiks-tv-card',
    name: navigator.language.startsWith('zh') ? '电视(ROS)' : 'TV(ROS)',
    description: navigator.language.startsWith('zh') ? '多种实体类型组合成TV' : 'Multiple entity types are combined to form a TV',
    preview: true // 启用预览
  },
  {
    type: 'aiks-light-card',
    name: navigator.language.startsWith('zh') ? '灯光(ROS)' : 'Light(ROS)',
    description: navigator.language.startsWith('zh') ? '可以记录多个灯光设备' : 'Multiple lighting devices can be recorded',
    preview: true // 启用预览
  },
  {
    type: 'aiks-fan-card',
    name: navigator.language.startsWith('zh') ? '风扇(ROS)' : 'Fan(ROS)',
    description: navigator.language.startsWith('zh') ? '可以记录多个风扇设备' : 'Multiple fan devices can be recorded',
    preview: true // 启用预览
  },
  {
    type: 'aiks-scene-card',
    name: navigator.language.startsWith('zh') ? '场景(ROS)' : 'Scene(ROS)',
    description: navigator.language.startsWith('zh') ? '可以记录多个场景设备' : 'Multiple scene devices can be recorded',
    preview: true // 启用预览
  },
  {
    type: 'aiks-media-player-card',
    name: navigator.language.startsWith('zh') ? '媒体播放器(ROS)' : 'Media Player(ROS)',
    description: navigator.language.startsWith('zh') ? '可以记录多个媒体播放器设备' : 'Multiple media player devices can be recorded',
    preview: true // 启用预览
  },
  {
    type: 'aiks-climate-card',
    name: navigator.language.startsWith('zh') ? '空调(ROS)' : 'Ac(ROS)',
    description: navigator.language.startsWith('zh') ? '可以记录多个气候设备' : 'Multiple climate devices can be recorded',
    preview: true // 启用预览
  },
  {
    type: 'aiks-cover-card',
    name: navigator.language.startsWith('zh') ? '窗帘(ROS)' : 'Cover(ROS)',
    description: navigator.language.startsWith('zh') ? '可以记录多个窗帘设备' : 'Multiple cover devices can be recorded',
    preview: true // 启用预览
  },
  {
    type: 'aiks-switch-card',
    name: navigator.language.startsWith('zh') ? '开关(ROS)' : 'Switch(ROS)',
    description: navigator.language.startsWith('zh') ? '可以记录多个开关设备' : 'Multiple switch devices can be recorded',
    preview: true // 启用预览
  },
  {
  type: 'aiks-weather-card',
  name: navigator.language.startsWith('zh') ? '天气(ROS)' : 'Weather(ROS)',
  description: navigator.language.startsWith('zh') ? '可以记录多个天气实体' : 'Multiple weather entities can be recorded',
  preview: true // 启用预览
  }
);