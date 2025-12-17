
import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksLightCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'light';
  }

  getExtraConfig() {
    return {
      independent_display: {
        type: 'checkbox',
        label: this._translations[this._language].independentDisplay,
        defaultValue: false  // 新增这一行
      }
    };
  }

}