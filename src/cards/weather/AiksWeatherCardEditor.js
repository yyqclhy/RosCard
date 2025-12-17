import { AiksUnifiedCardEditor } from '../../base/AiksUnifiedCardEditor.js';

export class AiksWeatherCardEditor extends AiksUnifiedCardEditor {
  getEntityDomain() {
    return 'weather';
  }
}