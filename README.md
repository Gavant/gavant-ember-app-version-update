gavant-ember-app-version-update
==============================================================================

Notifies users when a new app version is available, and automatically reloads the application.

Installation
------------------------------------------------------------------------------

```
ember install @gavant/ember-app-version-update
```

Add the settings below (shown with default values) to your app's config/environment.js to configure the addon. At the very least, you **must** set the `versionUpdate.version` value to a string of `"BUILD_VERSION"`. This is required, as it is a placeholder that is replaced during deployment with the application's actual current version number.

```js
let ENV = {

    //other environment configs...

    versionUpdate: {
        //REQUIRED - it must defined with a value of exactly "BUILD_VERSION"
        version: 'BUILD_VERSION',
        //the response header sent by your API which contains the current app version value
        header: 'x-web-version',
        //the websocket event type that contains a new app version value
        socketEventType: 'webVersionChange',
        //A delay (in milliseconds) to wait before automatically refreshing the user's browser
        //when a new app version is received
        refreshDelay: 60000
    }
}
```

Usage
------------------------------------------------------------------------------
By default, gavant-ember-app-version-update provides no user-facing UI to notify when a new version is received, other than automatically reloading the app after the auto-refresh timer expires.

However, you will almost definitely want to show the user some sort of notification that a version update is about to happen (an potentially allow them to cancel the automatic refresh). You can do this with the `VersionUpdate` service and its computed properties and events that it fires.

For example, to show a toast notification with [ember-cli-notifications](https://github.com/stonecircle/ember-cli-notifications):

```js
//application/route.js
export default Route.extend({
    versionUpdate: service(),
    notifications: service('notification-messages')

    afterModel() {
        this._super(...arguments);
        get(this, 'versionUpdate').on('versionChanged', this, () => {
            get(this, 'notifications').warning('A new version is available! Woohoo!');
        })
    }
});
```

The `VersionUpdate` service mixes in `@ember/object/evented` and fires a single event, `versionChanged` when a new version is recieved.

Additionally, the service exposes several convenience methods and properties that you can expose in your notification UI:

#### Methods

- **`refreshApp()`** - Triggers a normal browser window reload. Use this if your notification UI has a button to trigger a manual refresh.
- **`cancelAppRefresh()`** - Cancels the timer that will trigger the automatic app reload. Use this if your notification UI provides an "Upgrade later" button of some sort. (However, its good practice to keep the notification UI open even if the user cancels the auto-refresh, so that it doesnt go away until they reload.)

#### Properties

- **`upgradeAvailable`** (bool) When `true`, a new app version has been received and the app has not yet been reloaded.
- **`autoRefreshDate`** (date) A `Date` object that references when the automatic app reload will occur. Useful to show a live-updating countdown, using ember-moment's `{{moment-from-now}}` for example.

### Integrating with ember-data and ember-ajax

Almost all apps will need to do this, in order to trigger version updates when a new version is received via AJAX responses from your API. To do so, simply use the `DataAdapterMixin` in your application/adapter, and ajax service:

```js
import DataAdapterMixin from 'gavant-ember-app-version-update/mixins/data-adapter-mixin';
```

### Integrating with gavant-ember-websockets

If your app has websockets support with [gavant-ember-websockets](https://github.com/Gavant/gavant-ember-websockets), you can easily receive and process new version events over the global socket channel using the `SocketEventMixin`. It adds a listener for global events, and if a version change event type is detected, it triggers the app version update process.

```js
//application/route.js
import Route from '@ember/routing/route';
import SocketEventMixin from 'gavant-ember-app-version-update/mixins/socket-event-mixin';

export default Route.extend(SocketEventMixin, {
    //...
});
```


### Integrating with ember-simple-auth

In order to have version checking happen when the user logs in (via an /oauth/token request), we need to override the ember-simple-auth authenticator's `makeRequest()` method. It does not provide an easy way to access the response headers, re-implementing the `fetch()` network request is necessary. Ultimately, the changes should look something like this:

```js
export default Authenticator.extend({
    versionUpdate: service(),

    makeRequest(url, data, headers = {}) {
        //rest of method implementation...

        return new RSVP.Promise((resolve, reject) => {
            fetch(url, options).then((response) => {
                get(this, 'versionUpdate').checkResponseHeaders(get(response, 'headers.map'));

                //rest of method implementation...
            }).catch(reject);
        });
    }
});
```

### Testing in development

By default, the addon will not trigger the version update logic if the `ENV.versionUpdate.version` config's "BUILD_VERSION" placeholder value has not been replaced with a real version value. Since this normally only happens on a non-dev environment, to test the addon in dev you will just need to temporarily manually edit this value in `environment.js` to something other than "BUILD_VERSION".

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd gavant-ember-app-version-update`
* `yarn install`

### Linting

* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
