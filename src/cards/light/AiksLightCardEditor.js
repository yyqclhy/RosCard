
import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksLightCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'light';
  }

  getExtraConfig() {
    return {
      // // 别名输入框
      // alias: {
      //   type: 'alias',
      //   label: this._translations[this._language].anotherName,
      //   defaultValue: ''
      // },
      independent_display: {
        type: 'checkbox',
        label: this._translations[this._language].independentDisplay,
        defaultValue: false  // 新增这一行
      }
    };
  }

}