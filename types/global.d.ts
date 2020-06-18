// Types for compiled templates
declare module '@gavant/ember-app-version-update/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}
