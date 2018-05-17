import EmberObject from '@ember/object';
import DataAdapterMixinMixin from 'gavant-ember-app-version-update/mixins/data-adapter-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | data-adapter-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let DataAdapterMixinObject = EmberObject.extend(DataAdapterMixinMixin);
    let subject = DataAdapterMixinObject.create();
    assert.ok(subject);
  });
});
