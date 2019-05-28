import { getWithDefault } from '@ember/object';
import ENV from '../config/environment';
import Configuration from '@gavant/ember-app-version-update/configuration';

export default {
    name: '@gavant/ember-app-version-update',

    initialize() {
        const config = getWithDefault(ENV, 'versionUpdate', {});
        Configuration.load(config);
    }
};
