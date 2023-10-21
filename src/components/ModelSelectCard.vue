<template>
    <el-card class="hover:cursor-pointer" :shadow="isSelected ? 'always' : 'never'"
        @click="$emit('submitModel', modelValue)">
        <div id="img-amd-title" class="flex flex-row">
            <el-image class="w-6" :src="modelImage" />
            <span class="pt-1 mx-2 font-medium"> {{ modelName }} </span>
        </div>
        <div id="description" class="my-4">
            {{ modelDescription }}
        </div>
    </el-card>
</template>

<script lang="ts" setup>
defineProps({
    modelImage: {
        type: String,
        required: true
    },
    modelName: {
        type: String,
        required: true
    },
    modelValue: {
        type: String,
        required: true
    },
    modelDescription: {
        type: String,
        required: true
    },
    isSelected: {
        type: Boolean,
        required: true,
    }
})

defineEmits<{
    (e: "submitModel", modelValue: string): void;
}>();
</script>