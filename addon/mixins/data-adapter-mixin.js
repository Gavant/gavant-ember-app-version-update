import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Mixin.create({
    versionUpdate: service(),

    handleResponse(status, headers) {
        get(this, 'versionUpdate').checkResponseHeaders(headers);
        return this._super(...arguments);
    }
});
