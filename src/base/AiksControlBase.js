import { TRANSLATIONS, getLanguage } from '../utils/translations.js';

export class AiksControlBase extends HTMLElement {
  constructor() {
    super();
    this.firstRender = true;
    this._language = getLanguage();
    this._translations = TRANSLATIONS;
  }

  _createButton(label, handler) {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.style.margin = '4px';
    btn.style.padding = '8px 12px';
    btn.style.cursor = 'pointer';
    btn.style.borderRadius = '4px';
    btn.onclick = handler.bind(this);
    return btn;
  }

  _createIcon(iconPath) {
    const icon = document.createElement('img');
    icon.src = iconPath || this._translations[this._language].defaultIconPath;
    icon.style.position = 'absolute';
    icon.style.top = '50px';
    icon.style.right = '30px';
    icon.style.width = '60px';
    icon.style.height = '60px';
    return icon;
  }

  _t(key) {
    return this._translations[this._language]?.[key] || '';
  }
}