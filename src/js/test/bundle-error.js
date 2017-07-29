import Vue from '../lib/vue.min';
import Child from './child.vue';

SimpleLogger.tryCatch(() => {
    new Vue({
        el: '#app',
        components: {
            'child': Child
        },
        template: '<p>Test: <child/></p>'
    });
});