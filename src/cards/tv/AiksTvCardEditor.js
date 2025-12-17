import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksTvCardEditor extends AiksControlBase {
  static REMOTE_DEFAULTS = {
    android_tv: {
      POWER:'POWER', UP:'UP', DOWN:'DOWN', LEFT:'LEFT', RIGHT:'RIGHT',
      CENTER:'CENTER' ,ENTER:'ENTER', BACK:'BACK', PLAY:'PLAY', PAUSE:'PAUSE',
      VOLUME_UP:'VOLUME_UP', VOLUME_DOWN:'VOLUME_DOWN',
      MUTE:'MUTE', UN_MUTE:'UNMUTE', SETTINGS:'SETTINGS', HOME:'HOME', MENU:'MENU'
    },
    apple_tv: {
      POWER_ON:'wakeup' , POWER_OFF:'suspend', UP:'up', DOWN:'down', LEFT:'left', RIGHT:'right',
      CENTER:'select', BACK:'menu', PLAY:'play', PAUSE:'pause',
      VOLUME_UP:'volume_up', VOLUME_DOWN:'volume_down',
      MUTE:'mute', UN_MUTE:'', SETTINGS:'wakeup', HOME:'home', MENU:'menu'
    }
  };

  constructor() {
    super();
    this._translations = {
      ...this._translations,
      zh: {
        ...this._translations.zh,
        mediaCommands: [
          { label: '打开', value: 'turn_on' },
          { label: '关闭', value: 'turn_off' },
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
          { label: 'Turn on', value: 'turn_on' },
          { label: 'Turn off', value: 'turn_off' },
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
      type: newConfig.type || 'custom:aiks-tv-card',
      id: newConfig.id,
      tv_type: newConfig.tv_type || 'android_tv',
      tv_name: newConfig.tv_name || (this._language === 'zh' ? '未命名电视' : 'Unnamed TV'),
      media_play_entity: newConfig.media_play_entity || '',
      entities: Array.isArray(newConfig.entities) ? [...newConfig.entities] : []
    };

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

  render() {
    if (!this._config || !this._hass) return;
    this.innerHTML = '';

    const container = document.createElement('div');
    container.style.padding = '16px';

    // TV 类型选择
    const tvTypeWrapper = document.createElement('div');
    tvTypeWrapper.style.marginBottom = '16px';
    tvTypeWrapper.style.display = 'flex';
    tvTypeWrapper.style.alignItems = 'center';
    tvTypeWrapper.style.gap = '12px';

    const tvTypeLabel = document.createElement('span');
    tvTypeLabel.innerText = this._language === 'zh' ? '设备类型:' : 'Device Type:';
    tvTypeLabel.style.width = '100px';
    tvTypeLabel.style.fontWeight = 'bold';
    tvTypeWrapper.appendChild(tvTypeLabel);

    const tvTypeSelect = document.createElement('select');
    tvTypeSelect.style.width = '150px';
    tvTypeSelect.style.padding = '6px';
    tvTypeSelect.style.borderRadius = '4px';

    [
      { value: 'apple_tv', label: 'Apple TV' },
      { value: 'android_tv', label: this._language === 'zh' ? '安卓电视' : 'Android TV' }
    ].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.text = opt.label;
      if (this._config.tv_type === opt.value) option.selected = true;
      tvTypeSelect.appendChild(option);
    });
    tvTypeSelect.addEventListener('change', () => {
      this._config.tv_type = tvTypeSelect.value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
      this.render();
    });
    tvTypeWrapper.appendChild(tvTypeSelect);
    container.appendChild(tvTypeWrapper);

    // Media Player 选择（使用 ha-selector）
    if (this._config.tv_type === 'apple_tv' || this._config.tv_type === 'android_tv') {
      const mediaWrapper = document.createElement('div');
      mediaWrapper.style.marginBottom = '16px';
      mediaWrapper.style.display = 'flex';
      mediaWrapper.style.alignItems = 'center';
      mediaWrapper.style.gap = '12px';

      const mediaLabel = document.createElement('span');
      mediaLabel.innerText = this._language === 'zh' ? '播放实体:' : 'Media Player:';
      mediaLabel.style.width = '100px';
      mediaLabel.style.fontWeight = 'bold';
      mediaWrapper.appendChild(mediaLabel);

      const mediaSelector = document.createElement('ha-selector');
      mediaSelector.hass = this._hass;
      mediaSelector.selector = {
        entity: {
          filter: {
            domain: 'media_player'
          }
        }
      };
      mediaSelector.value = this._config.media_play_entity || '';
      mediaSelector.style.cssText = `
        flex: 1;
        max-width: 300px;
      `;

      mediaSelector.addEventListener('value-changed', (e) => {
        this._config.media_play_entity = e.detail.value || '';
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: { ...this._config } },
          bubbles: true,
          composed: true
        }));
      });
      mediaWrapper.appendChild(mediaSelector);
      container.appendChild(mediaWrapper);
    }

    // TV 名称输入
    const nameWrapper = document.createElement('div');
    nameWrapper.style.marginBottom = '16px';
    nameWrapper.style.display = 'flex';
    nameWrapper.style.alignItems = 'center';
    nameWrapper.style.gap = '12px';

    const nameLabel = document.createElement('span');
    nameLabel.innerText = this._translations[this._language].nameLabel;
    nameLabel.style.width = '100px';
    nameLabel.style.fontWeight = 'bold';
    nameWrapper.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = this._config.tv_name;
    nameInput.style.cssText = `
      flex: 1;
      max-width: 300px;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
    `;
    nameInput.addEventListener('blur', () => {
      this._config.tv_name = nameInput.value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
    });
    nameWrapper.appendChild(nameInput);
    container.appendChild(nameWrapper);

    // 实体列表
    const entityLabel = document.createElement('div');
    entityLabel.innerText = this._language === 'zh' ? '按键配置' : 'Button Configuration';
    entityLabel.style.cssText = `
      font-weight: bold;
      margin-bottom: 12px;
      margin-top: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--divider-color);
    `;
    container.appendChild(entityLabel);

    const entityContainer = document.createElement('div');
    entityContainer.id = 'entityContainer';
    entityContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // 基础按钮
    const baseKeys = [
      'UP','DOWN','LEFT','RIGHT','CENTER','BACK','PLAY',
      'PAUSE','VOLUME_UP','VOLUME_DOWN','MUTE','UN_MUTE','SETTINGS','HOME','MENU'
    ];

    const android_tv = ['POWER'];
    const apple_tv = ['POWER_ON','POWER_OFF'];
    const numericKeys = [
      'NUM_0','NUM_1','NUM_2','NUM_3','NUM_4',
      'NUM_5','NUM_6','NUM_7','NUM_8','NUM_9',
      'DELETE'
    ];

    const useNumeric = this._config.tv_type === 'android_tv';
    const predefinedKeys = useNumeric 
      ? [...android_tv, ...baseKeys, ...numericKeys] 
      : [...apple_tv, ...baseKeys];

    // 保留旧的实体配置
    const prevByKey = {};
    (this._config.entities || []).forEach(e => {
      if (e && e.key) {
        prevByKey[e.key] = e;
      }
    });

    // 重建 entities
    this._config.entities = predefinedKeys.map(k => {
      const old = prevByKey[k];
      if (old) {
        return { ...old, key: k };
      }
      return { key: k, type: '', entity_id: '', value: '' };
    });

    // 渲染行
    this._config.entities.forEach((cfg, idx) => {
      entityContainer.appendChild(this._createEntityRow(idx, cfg, this._hass));
    });
    container.appendChild(entityContainer);

    this.appendChild(container);
  }

  _showToast(msg) {
    try { 
      this.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg } })); 
    } catch(e) { 
      console.warn(msg); 
    }
  }

  _sendTest(cfg, rawInput) {
    const hass = this._hass;
    if (!hass) { 
      this._showToast(this._language === 'zh' ? 'hass未就绪' : 'hass not ready'); 
      return; 
    }

    const eid  = cfg?.entity_id || '';
    const type = eid ? eid.split('.')[0] : (cfg?.type || '');
    let   v    = (rawInput ?? cfg?.value ?? '').toString().trim();

    if (!eid || !type) { 
      this._showToast(this._language === 'zh' ? '请先选择实体' : 'Please select entity first'); 
      return; 
    }
    if (!v && type !== 'media_player') { 
      this._showToast(this._language === 'zh' ? '请先填写命令/选项' : 'Please enter command/option'); 
      return; 
    }

    if (type === 'remote') {
      hass.callService('remote', 'send_command', { entity_id: eid, command: v });
      return;
    }

    if (type === 'media_player') {
      if (v === 'volume_mute_true' || v === 'volume_mute_false') {
        hass.callService('media_player', 'volume_mute', { 
          entity_id: eid, 
          is_volume_muted: v.endsWith('_true') 
        });
      } else if (v.startsWith('volume_set_')) {
        const lvl = parseFloat(v.split('_').pop());
        if (!Number.isNaN(lvl)) {
          hass.callService('media_player', 'volume_set', { 
            entity_id: eid, 
            volume_level: Math.max(0, Math.min(1, lvl)) 
          });
        } else {
          this._showToast(this._language === 'zh' 
            ? '音量格式应为 volume_set_0.0~1.0' 
            : 'Volume format should be volume_set_0.0~1.0');
        }
      } else {
        hass.callService('media_player', v || 'media_play', { entity_id: eid });
      }
      return;
    }

    if (type === 'select') {
      hass.callService('select', 'select_option', { entity_id: eid, option: v });
      return;
    }

    this._showToast(this._language === 'zh' 
      ? `不支持的类型：${type}` 
      : `Unsupported type: ${type}`);
  }

  _createEntityRow(index, config, hass) {
    const row = document.createElement('div');
    row.style.cssText = `
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.02);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    `;

    const keyLabel = document.createElement('div');
    keyLabel.innerText = config.key;
    keyLabel.style.cssText = `
      font-weight: 500;
      font-size: 0.9em;
    `;
    row.appendChild(keyLabel);

    // 实体选择器（使用 ha-selector）
    const entitySelector = document.createElement('ha-selector');
    entitySelector.hass = hass;
    entitySelector.selector = {
      entity: {
        filter: {
          domain: ['media_player', 'remote', 'select']
        }
      }
    };
    entitySelector.value = config.entity_id || '';
    entitySelector.style.cssText = `
      min-width: 0;
    `;

    const compContainer = document.createElement('div');
    compContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      min-width: 0;
    `;

    const updateRow = (patch = {}) => {
      const next = this._config.entities.map((e, i) => 
        i === index ? { ...e, ...patch } : e
      );
      this._config = { ...this._config, entities: next };
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      }));
    };

    const renderSubComp = () => {
      compContainer.innerHTML = '';
      const eid = entitySelector.value;
      const type = eid ? eid.split('.')[0] : '';

      let inputEl = null;
      if (type === 'media_player') {
        const cmdSel = document.createElement('select');
        cmdSel.style.cssText = `
          padding: 6px;
          border-radius: 4px;
          border: 1px solid var(--divider-color);
        `;
        cmdSel.innerHTML = `<option value="">${this._translations[this._language].selectCommand}</option>`;
        this._translations[this._language].mediaCommands.forEach(cmd => {
          const opt = document.createElement('option');
          opt.value = cmd.value;
          opt.text = cmd.label;
          if (cmd.value === config.value) opt.selected = true;
          cmdSel.appendChild(opt);
        });
        cmdSel.addEventListener('change', () => updateRow({ value: cmdSel.value }));
        compContainer.appendChild(cmdSel);
        inputEl = cmdSel;
      } else if (type === 'select' && hass.states[eid]?.attributes?.options) {
        const optSel = document.createElement('select');
        optSel.style.cssText = `
          padding: 6px;
          border-radius: 4px;
          border: 1px solid var(--divider-color);
        `;
        optSel.innerHTML = `<option value="">${this._translations[this._language].selectOption}</option>`;
        hass.states[eid].attributes.options.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o;
          opt.text = o;
          if (o === config.value) opt.selected = true;
          optSel.appendChild(opt);
        });
        optSel.addEventListener('change', () => updateRow({ value: optSel.value }));
        compContainer.appendChild(optSel);
        inputEl = optSel;
      } else if (type === 'remote') {
        const inp = document.createElement('input');
        inp.type = 'text';

        if (!config.value) {
          const tvt = this._config.tv_type || 'android_tv';
          const defVal = AiksTvCardEditor.REMOTE_DEFAULTS?.[tvt]?.[config.key] || '';
          inp.value = defVal;
          updateRow({ value: defVal });
        } else {
          inp.value = config.value;
        }

        inp.style.cssText = `
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid var(--divider-color);
          min-width: 150px;
        `;
        inp.placeholder = this._translations[this._language].enterCommand;
        inp.addEventListener('blur', () => updateRow({ value: inp.value }));
        compContainer.appendChild(inp);

        const resetBtn = this._createButton(
          this._language === 'zh' ? '恢复默认' : 'Reset',
          () => {
            const tvt = this._config.tv_type || 'android_tv';
            const defVal = AiksTvCardEditor.REMOTE_DEFAULTS?.[tvt]?.[config.key] || '';
            inp.value = defVal;
            updateRow({ value: defVal });
          }
        );
        resetBtn.style.padding = '4px 10px';
        resetBtn.style.fontSize = '0.85em';
        compContainer.appendChild(resetBtn);

        const testBtn = this._createButton(
          this._translations[this._language].testButton,
          () => this._sendTest(
            { key: config.key, type, entity_id: entitySelector.value, value: inp.value },
            inp.value
          )
        );
        testBtn.style.padding = '4px 10px';
        testBtn.style.fontSize = '0.85em';
        compContainer.appendChild(testBtn);
      } else if (eid) {
        const placeholder = document.createElement('span');
        placeholder.style.cssText = `
          font-size: 0.85em;
          opacity: 0.6;
        `;
        placeholder.innerText = this._language === 'zh' ? '选择有效实体' : 'Select valid entity';
        compContainer.appendChild(placeholder);
      }

      if (inputEl && type !== 'remote') {
        const testBtn = this._createButton(
          this._translations[this._language].testButton,
          () => this._sendTest(
            { key: config.key, type, entity_id: entitySelector.value, value: inputEl.value },
            inputEl.value
          )
        );
        testBtn.style.padding = '4px 10px';
        testBtn.style.fontSize = '0.85em';
        compContainer.appendChild(testBtn);
      }
    };

    entitySelector.addEventListener('value-changed', (e) => {
      const eid = e.detail.value || '';
      const type = eid ? eid.split('.')[0] : '';

      const patch = { entity_id: eid, type };

      if (type === 'remote') {
        const tvt = this._config.tv_type || 'android_tv';
        patch.value = (AiksTvCardEditor.REMOTE_DEFAULTS?.[tvt]?.[config.key]) || '';
      }

      updateRow(patch);
      renderSubComp();
    });

    if (config.entity_id) {
      entitySelector.value = config.entity_id;
      renderSubComp();
    }

    row.appendChild(entitySelector);
    row.appendChild(compContainer);

    return row;
  }
}