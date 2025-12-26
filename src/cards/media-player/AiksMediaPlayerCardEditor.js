import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksMediaPlayerCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'media_player';
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
      },
      // ✅ 新增：remote 实体选择框
      remoteId: {
        type: 'entity',
        domain: 'remote',
        label: this._translations?.[this._language]?.remoteDevice ?? 'Remote',
        defaultValue: ''
      }
    };
  }

}