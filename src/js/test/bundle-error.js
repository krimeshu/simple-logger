import Vue from '../lib/vue.min';
import Child from './child.vue';

// Vue's global error capture hook
Vue.config.errorHandler = function (err, vm, info) {
    alert('Vue errorHandler:', [].splice.call(arguments));
    SimpleLogger.handleErrror(err);
};

new Vue({
    el: '#app',
    components: {
        'child': Child
    },
    template: `
        <div>
            <child></child>
        </div>
        `
});