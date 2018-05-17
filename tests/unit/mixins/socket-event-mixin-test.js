import EmberObject from '@ember/object';
import SocketEventMixinMixin from 'gavant-ember-app-version-update/mixins/socket-event-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | socket-event-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SocketEventMixinObject = EmberObject.extend(SocketEventMixinMixin);
    let subject = SocketEventMixinObject.create();
    assert.ok(subject);
  });
});
