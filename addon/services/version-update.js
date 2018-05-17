import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { get, set, setProperties, observer, computed } from '@ember/object';
import { isBlank, isNone } from '@ember/utils';
import { later, cancel } from '@ember/runloop';
import safeInjectService from './../macros/safe-inject-service';
import Configuration from './../configuration';
import { BUILD_VERSION_PLACEHOLDER } from './../constants';

export default Service.extend(Evented, {
    fastboot: safeInjectService('fastboot'),
    appVersion: Configuration.version,
    buildVersionHeader: Configuration.header,
    autoRefreshDelay: Configuration.refreshDelay,
    autoRefreshTimer: null,
    autoRefreshDate: null,
    autoRefreshCanceled: false,
    latestAppVersion: null,

    upgradeAvailable: computed('appVersion', 'latestAppVersion', function() {
        const appVersion = get(this, 'appVersion');
        const latestAppVersion = get(this, 'latestAppVersion');
        //if the current app version is the placeholder value,
        //it wasnt properly replaced in the build process (or we are in dev)
        //so dont trigger the app upgrade UI
        return !isBlank(latestAppVersion) && (appVersion !== latestAppVersion) && (appVersion !== BUILD_VERSION_PLACEHOLDER);
    }),

    latestAppVersionDidChange: observer('latestAppVersion', function() {
        //schedule an automatic app refresh if an upgrade is available
        //but only if auto refresh is not already scheduled,
        //and the user has not canceled a previous auto refresh
        if(get(this, 'upgradeAvailable') && isNone(get(this, 'autoRefreshTimer')) && !get(this, 'autoRefreshCanceled')) {
            this.scheduleAppRefresh();
            //also trigger an event when a the app version changes
            if(!get(this, 'fastboot.isFastBoot')) {
                this.trigger('versionChanged', get(this, 'latestAppVersion'));
            }
        }
    }),

    checkResponseHeaders(headers) {
        const normalizedHeaders = this.normalizeHeaders(headers);
        const header = get(this, 'buildVersionHeader');
        const latestAppVersion = get(normalizedHeaders, header ? header.toLowerCase() : null);
        if(!isBlank(latestAppVersion)) {
            set(this, 'latestAppVersion', latestAppVersion);
        }
    },

    scheduleAppRefresh() {
        const delay = get(this, 'autoRefreshDelay');
        //if the delay is not defined/null/false, dont schedule an auto-refresh
        //a delay of 0 will trigger an immediate refresh
        if(delay !== false && !isNone(delay)) {
            const autoRefreshDate = new Date();
            autoRefreshDate.setTime(new Date().getTime() + delay);

            setProperties(this, {
                autoRefreshDate,
                autoRefreshTimer: later(this, 'refreshApp', delay)
            });
        }
    },

    cancelAppRefresh() {
        cancel(get(this, 'autoRefreshTimer'));
        setProperties(this, {
            autoRefreshCanceled: true,
            autoRefreshTimer: null,
            autoRefreshDate: null
        });
    },

    refreshApp() {
        if(!get(this, 'fastboot.isFastBoot')) {
            window.location.reload();
        }
    },

    normalizeHeaders(headers) {
        const normalizedHeaders = {};
        Object.keys(headers || {}).forEach((key) => {
            normalizedHeaders[key.toLowerCase()] = headers[key];
        });

        return normalizedHeaders;
    }
});
