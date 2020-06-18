import { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import Service from '@ember/service';

export default function safeInjectService(service: string) {
    return computed(service, function () {
        return getOwner(this).lookup(`service:${service}`);
    });
}
