<script setup lang="ts">
import { ref } from 'vue';

import * as ConfigState from '../../library/state';

const config = ref(ConfigState.read());

function save() {
    ConfigState.write(config.value);
}

</script>

<template>
    <section class="px-4 flex flex-col gap-1">
        <input class="p-1 border shadow-sm w-60" type="number" v-model="config.numWeeks">
        <div class="flex gap-2">
            <button class="border border-slate-800 px-3 py-1 rounded-full font-bold" type="button" @click="save">Save</button>
            <button class="border border-slate-800 px-3 py-1 rounded-full font-bold" type="button" @click="ConfigState.refresh">Refresh</button>
            <button class="border border-red-800 px-3 py-1 rounded-full font-bold" type="button" @click="ConfigState.clear">Clear</button>
        </div>
    </section>
</template>