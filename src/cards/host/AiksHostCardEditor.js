import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksHostCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'remote';
  }
}