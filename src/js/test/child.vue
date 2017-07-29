<template>
    <div class="child">
        <button @click="throwBundleError">
            Throw Error in bundled script, not wrapped in SimpleLogger.tryCatch
        </button>
        <button @click="throwBundleErrorWrapped">
            Throw Error in bundled script, wrapped in SimpleLogger.tryCatch
        </button>
    </div>
</template>
<script>
export default {
    methods: {
        throwBundleError() {
            throw new Error('Error occured in bundled script.');
        },
        throwBundleErrorWrapped() {
            SimpleLogger.tryCatch(() => {
                throw new Error('Error occured in bundled script.');
            });
        }
    }
};
</script>