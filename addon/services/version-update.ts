import { observes } from '@ember-decorators/object';
import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { get, set, setProperties, computed } from '@ember/object';
import { isBlank, isNone } from '@ember/utils';
import { later, cancel } from '@ember/runloop';
import safeInjectService from './../macros/safe-inject-service';
import Configuration from './../configuration';
import { BUILD_VERSION_PLACEHOLDER } from './../constants';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import { EmberRunTimer } from '@ember/runloop/types';

interface headers {
    [key: string]: any;
}
export default class VersionUpdateService extends Service.extend(Evented) {
    @safeInjectService('fastboot') fastboot!: FastbootService;

    appVersion = Configuration.version;
    buildVersionHeader = Configuration.header;
    autoRefreshDelay = Configuration.refreshDelay;
    autoRefreshTimer?: EmberRunTimer;
    autoRefreshDate?: Date;
    autoRefreshCanceled: boolean = false;
    latestAppVersion?: string;

    /**
     *  if the current app version is the placeholder value,
     *  it wasnt properly replaced in the build process (or we are in dev)
     *  so dont trigger the app upgrade UI
     *
     * @readonly
     * @memberof VersionUpdateService
     */
    @computed('appVersion', 'latestAppVersion')
    get upgradeAvailable() {
        const appVersion = this.appVersion;
        const latestAppVersion = this.latestAppVersion;

        return (
            !isBlank(latestAppVersion) && appVersion !== latestAppVersion && appVersion !== BUILD_VERSION_PLACEHOLDER
        );
    }

    /**
     *  schedule an automatic app refresh if an upgrade is available
     *  but only if auto refresh is not already scheduled,
     *  and the user has not canceled a previous auto refresh
     *
     * @memberof VersionUpdateService
     */
    @observes('latestAppVersion')
    latestAppVersionDidChange() {
        if (this.upgradeAvailable && isNone(this.autoRefreshTimer) && !this.autoRefreshCanceled) {
            this.scheduleAppRefresh();
            //also trigger an event when a the app version changes
            if (!this.fastboot.isFastBoot) {
                this.trigger('versionChanged', this.latestAppVersion);
            }
        }
    }

    checkResponseHeaders(headers: headers) {
        const normalizedHeaders = this.normalizeHeaders(headers);
        const header = get(this, 'buildVersionHeader');
        const name = header?.toLowerCase();
        if (name) {
            const latestAppVersion = normalizedHeaders[name];
            this.latestAppVersion = latestAppVersion;
            // set(this, 'latestAppVersion', latestAppVersion);
        }
    }

    scheduleAppRefresh() {
        const delay = this.autoRefreshDelay;
        //a delay of 0 will trigger an immediate refresh
        if (!isNone(delay)) {
            const autoRefreshDate = new Date();
            autoRefreshDate.setTime(new Date().getTime() + delay);
            this.autoRefreshDate = autoRefreshDate;
            this.autoRefreshTimer = later(() => this.refreshApp(), delay);
        }
    }

    cancelAppRefresh() {
        if (this.autoRefreshTimer) {
            cancel(this.autoRefreshTimer);
            setProperties(this, {
                autoRefreshCanceled: true,
                autoRefreshTimer: undefined,
                autoRefreshDate: undefined
            });
        }
    }

    refreshApp() {
        if (!this.fastboot.isFastBoot) {
            window.location.reload();
        }
    }

    normalizeHeaders(headers: headers) {
        const normalizedHeaders = {} as headers;
        Object.keys(headers || {}).forEach((key) => {
            normalizedHeaders[key.toLowerCase()] = headers[key];
        });

        return normalizedHeaders;
    }

    onGlobalEvent(event: { type: string; message: string }) {
        if (event?.type === Configuration.socketEventType) {
            this.checkResponseHeaders({
                [Configuration.header]: event.message
            });
        }
    }
}
