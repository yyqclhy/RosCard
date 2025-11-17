export const TRANSLATIONS = {
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
    defaultIconPath: '/local/community/RosCard/icon_img/states_device_light_on_icon.png',
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
    defaultIconPath: '/local/community/RosCard/icon_img/states_device_light_on_icon.png',
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

export function getLanguage() {
  return navigator.language.startsWith('zh') ? 'zh' : 'en';
}