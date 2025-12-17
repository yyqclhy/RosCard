import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksSceneCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'scene';
  }

  // 定义额外配置：dropdown 选择执行方式
  getExtraConfig(entity) {
    return {
      mode: {
        type: 'select',
        label: this._language === 'zh' ? '执行方式' : 'Mode',
        defaultValue: 'immediate',  // 新增：默认值由基类处理
        options: [
          { 
            value: 'immediate', 
            label: this._language === 'zh' ? '立即执行' : 'Immediate'
          },
          { 
            value: 'delayed', 
            label: this._language === 'zh' ? '延迟执行' : 'Delayed'
          },
          { 
            value: 'popup', 
            label: this._language === 'zh' ? '弹窗询问' : 'Popup Ask'
          }
        ]
      }
    };
  }

  // 可选：如果有自定义处理逻辑，可以保留
  // 如果不需要特殊处理，这个方法可以删除（使用基类默认实现）
  handleExtraConfigChange(entities, index, key, value) {
    entities[index][key] = value;
  }
}