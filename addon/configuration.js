import { get, setProperties } from '@ember/object';
import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';

//addon configuration loading/default values
//inspired by https://github.com/simplabs/ember-simple-auth/blob/1.6.0/addon/configuration.js

const DEFAULTS = {
    header: 'x-web-version',
    socketEventType: 'webVersionChange',
    refreshDelay: 60000
};

export default {
    load(config) {
        const configProps = assign({}, DEFAULTS, config);
        setProperties(this, configProps);
        this.validate();
    },

    validate() {
        //normally, the environment.js needs a config property set to a string of "BUILD_VERSION"
        //which is replaced with the application's real build version at build/deployment time
        assert(
            `An ENV.versionUpdate.version config must be provided for gavant-ember-app-version-update`,
             !isEmpty(get(this, 'version'))
        );
    }
};
