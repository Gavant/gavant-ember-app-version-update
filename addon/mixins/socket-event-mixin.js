import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Configuration from './../configuration';

export default Mixin.create({
    versionUpdate: service(),

    onGlobalEvent() {
        const event = this._super(...arguments);
        if(event && get(event, 'type') === Configuration.socketEventType) {
            get(this, 'versionUpdate').checkResponseHeaders({
                [Configuration.header]: get(event, 'message')
            });
        }
    }
});
