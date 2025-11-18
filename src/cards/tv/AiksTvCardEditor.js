import { AiksControlBase } from '../../base/AiksControlBase.js';

export class AiksTvCardEditor extends AiksControlBase {
  static REMOTE_DEFAULTS = {
    android_tv: {
      POWER:'POWER', UP:'UP', DOWN:'DOWN', LEFT:'LEFT', RIGHT:'RIGHT',
      ENTER:'ENTER', BACK:'BACK', PLAY:'PLAY', PAUSE:'PAUSE',
      VOLUME_UP:'VOLUME_UP', VOLUME_DOWN:'VOLUME_DOWN',
      MUTE:'MUTE', UN_MUTE:'UNMUTE', SETTINGS:'SETTINGS', HOME:'HOME', MENU:'MENU'
    },
    apple_tv: {
      POWER:'suspend', UP:'up', DOWN:'down', LEFT:'left', RIGHT:'right',
      ENTER:'select', BACK:'menu', PLAY:'play', PAUSE:'pause',
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
    tvTypeWrapper.style.marginBottom = '10px';
    tvTypeWrapper.style.display = 'flex';
    tvTypeWrapper.style.alignItems = 'center';

    const tvTypeLabel = document.createElement('span');
    tvTypeLabel.innerText = this._language === 'zh' ? '设备类型: ' : 'Device Type: ';
    tvTypeLabel.style.width = '100px';
    tvTypeWrapper.appendChild(tvTypeLabel);

    const tvTypeSelect = document.createElement('select');
    tvTypeSelect.style.width = '120px';

    [
      { value: 'apple_tv', label: this._language === 'zh' ? 'Apple TV' : 'Apple TV' },
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
      if (tvTypeSelect.value === 'android_tv') this._config.media_play_entity = '';
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
      this.render();
    });
    tvTypeWrapper.appendChild(tvTypeSelect);
    container.appendChild(tvTypeWrapper);

    // Apple TV 专用 media_player 选择
    if (this._config.tv_type === 'apple_tv') {
      const mediaWrapper = document.createElement('div');
      mediaWrapper.style.marginBottom = '10px';
      mediaWrapper.style.display = 'flex';
      mediaWrapper.style.alignItems = 'center';

      const mediaLabel = document.createElement('span');
      mediaLabel.innerText = this._language === 'zh' ? '播放实体: ' : 'Media Player: ';
      mediaLabel.style.width = '100px';
      mediaWrapper.appendChild(mediaLabel);

      const mediaSelect = document.createElement('select');
      mediaSelect.style.width = '200px';
      mediaSelect.innerHTML = `<option value="">${this._translations[this._language].selectEntity}</option>`;
      Object.keys(this._hass.states).forEach(entityId => {
        if (entityId.startsWith('media_player.')) {
          const option = document.createElement('option');
          option.value = entityId;
          option.text = this._hass.states[entityId]?.attributes?.friendly_name || entityId;
          if (entityId === this._config.media_play_entity) option.selected = true;
          mediaSelect.appendChild(option);
        }
      });
      mediaSelect.addEventListener('change', () => {
        this._config.media_play_entity = mediaSelect.value;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
      });
      mediaWrapper.appendChild(mediaSelect);
      container.appendChild(mediaWrapper);
    }

    // 电视名称
    const nameWrapper = document.createElement('div');
    nameWrapper.style.marginBottom = '10px';
    nameWrapper.style.display = 'flex';
    nameWrapper.style.alignItems = 'center';

    const nameLabel = document.createElement('span');
    nameLabel.innerText = this._translations[this._language].nameLabel;
    nameLabel.style.width = '100px';
    nameWrapper.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = this._config.tv_name;
    nameInput.style.width = '200px';
    nameInput.addEventListener('blur', () => {
      this._config.tv_name = nameInput.value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } } }));
    });
    nameWrapper.appendChild(nameInput);
    container.appendChild(nameWrapper);

    // 实体列表
    const entityContainer = document.createElement('div');
    entityContainer.id = 'entityContainer';
    const predefinedKeys = ['POWER','UP','DOWN','LEFT','RIGHT','ENTER','BACK','PLAY','PAUSE','VOLUME_UP','VOLUME_DOWN','MUTE','UN_MUTE','SETTINGS','HOME','MENU'];
    this._config.entities = predefinedKeys.map((k,i)=>this._config.entities[i]||{key:k,type:'',entity_id:'',value:''});
    this._config.entities.forEach((cfg,idx)=>{
      entityContainer.appendChild(this._createEntityRow(idx,cfg,this._hass));
    });
    container.appendChild(entityContainer);

    this.appendChild(container);
  }

  _showToast(msg) {
    try { this.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg } })); }
    catch(e) { console.warn(msg); }
  }

  _sendTest(cfg, rawInput) {
    const hass = this._hass;
    if (!hass) { this._showToast('hass 未就绪'); return; }

    const eid  = cfg?.entity_id || '';
    const type = eid ? eid.split('.')[0] : (cfg?.type || '');
    let   v    = (rawInput ?? cfg?.value ?? '').toString().trim();

    if (!eid || !type) { this._showToast('请先选择实体'); return; }
    if (!v && type !== 'media_player') { this._showToast('请先填写命令/选项'); return; }

    if (type === 'remote') {
      hass.callService('remote', 'send_command', { entity_id: eid, command: v });
      return;
    }

    if (type === 'media_player') {
      if (v === 'volume_mute_true' || v === 'volume_mute_false') {
        hass.callService('media_player', 'volume_mute', { entity_id: eid, is_volume_muted: v.endsWith('_true') });
      } else if (v.startsWith('volume_set_')) {
        const lvl = parseFloat(v.split('_').pop());
        if (!Number.isNaN(lvl)) {
          hass.callService('media_player', 'volume_set', { entity_id: eid, volume_level: Math.max(0, Math.min(1, lvl)) });
        } else {
          this._showToast('音量格式应为 volume_set_0.0~1.0');
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

    this._showToast(`不支持的类型：${type}`);
  }

  _createEntityRow(index, config, hass) {
    const row = document.createElement('div');
    row.style.marginBottom = '10px';
    row.style.display = 'flex';
    row.style.alignItems = 'center';

    const keyLabel = document.createElement('span');
    keyLabel.innerText = `${config.key}: `;
    keyLabel.style.width = '100px';
    row.appendChild(keyLabel);

    const entitySelect = document.createElement('select');
    entitySelect.style.width = '200px';
    entitySelect.innerHTML = `<option value="">${this._translations[this._language].selectEntity}</option>`;
    Object.keys(hass.states).forEach(eid=>{
      if (eid.startsWith('media_player.')||eid.startsWith('remote.')||eid.startsWith('select.')){
        const opt=document.createElement('option');
        opt.value=eid;
        opt.text=(hass.states[eid]?.attributes?.friendly_name)||eid;
        if(eid===config.entity_id) opt.selected=true;
        entitySelect.appendChild(opt);
      }
    });
    row.appendChild(entitySelect);

    const compContainer=document.createElement('div');
    compContainer.style.marginLeft='10px';
    row.appendChild(compContainer);

    const updateRow = (patch = {}) => {
      const next = this._config.entities.map((e, i) => i === index ? { ...e, ...patch } : e);
      this._config = { ...this._config, entities: next };
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      }));
    };

    const renderSubComp=()=>{
      compContainer.innerHTML='';
      const eid=entitySelect.value;
      const type=eid?eid.split('.')[0]:'';

      let inputEl=null;
      if(type==='media_player'){
        const cmdSel=document.createElement('select');
        cmdSel.style.width='200px';
        cmdSel.innerHTML=`<option value="">${this._translations[this._language].selectCommand}</option>`;
        this._translations[this._language].mediaCommands.forEach(cmd=>{
          const opt=document.createElement('option');
          opt.value=cmd.value;
          opt.text=cmd.label;
          if(cmd.value===config.value) opt.selected=true;
          cmdSel.appendChild(opt);
        });
        cmdSel.addEventListener('change', () => updateRow({ value: cmdSel.value }));
        compContainer.appendChild(cmdSel);
        inputEl=cmdSel;
      } else if(type==='select' && hass.states[eid]?.attributes?.options){
        const optSel=document.createElement('select');
        optSel.style.width='200px';
        optSel.innerHTML=`<option value="">${this._translations[this._language].selectOption}</option>`;
        hass.states[eid].attributes.options.forEach(o=>{
          const opt=document.createElement('option');
          opt.value=o; opt.text=o;
          if(o===config.value) opt.selected=true;
          optSel.appendChild(opt);
        });
        optSel.addEventListener('change', () => updateRow({ value: optSel.value }));
        compContainer.appendChild(optSel);
        inputEl=optSel;
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

        inp.style.width = '200px';
        inp.placeholder = this._translations[this._language].enterCommand;
        inp.addEventListener('input', () => updateRow({ value: inp.value }));
        compContainer.appendChild(inp);

        const resetBtn = this._createButton(
          this._language === 'zh' ? '恢复默认' : 'Reset Default',
          () => {
            const tvt = this._config.tv_type || 'android_tv';
            const defVal = AiksTvCardEditor.REMOTE_DEFAULTS?.[tvt]?.[config.key] || '';
            inp.value = defVal;
            updateRow({ value: defVal });
          }
        );
        compContainer.appendChild(resetBtn);

        const testBtn = this._createButton(
          this._translations[this._language].testButton,
          () => this._sendTest(
            { key: config.key, type, entity_id: entitySelect.value, value: inp.value },
            inp.value
          )
        );
        compContainer.appendChild(testBtn);
      } else {
        compContainer.innerHTML=`<span>${this._translations[this._language].validEntity}</span>`;
      }

      if (inputEl) {
        const testBtn = this._createButton(
          this._translations[this._language].testButton,
          () => this._sendTest(
            { key: config.key, type, entity_id: entitySelect.value, value: inputEl.value },
            inputEl.value
          )
        );
        compContainer.appendChild(testBtn);
      }
    };

    entitySelect.addEventListener('change', () => {
      const eid = entitySelect.value || '';
      const type = eid ? eid.split('.')[0] : '';

      const patch = { entity_id: eid, type };

      if (type === 'remote') {
        const tvt = this._config.tv_type || 'android_tv';
        patch.value = (AiksTvCardEditor.REMOTE_DEFAULTS?.[tvt]?.[config.key]) || '';
      }

      updateRow(patch);
      renderSubComp();
    });

    if(config.entity_id){entitySelect.value=config.entity_id;renderSubComp();}

    return row;
  }


}
