import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksHostCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'remote';
  }
  
  // getExtraConfig() {
  //   return {
  //     // 别名输入框
  //     alias: {
  //       type: 'alias',
  //       label: this._translations[this._language].anotherName,
  //       defaultValue: ''
  //     }
  //   };
  // }
}