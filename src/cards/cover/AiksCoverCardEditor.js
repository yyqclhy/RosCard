
import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksCoverCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'cover';
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