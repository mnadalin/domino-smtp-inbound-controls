<script setup>
defineProps({
	svg: { type: String, required: true },
	size: { type: [Number, String], default: 18 },
})
</script>

<template>
	<span class="svg-icon" :style="`width:${size}px;height:${size}px`" v-html="svg" />
</template>

<style scoped>
.svg-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.svg-icon :deep(svg) {
	width: 100%;
	height: 100%;
	fill: currentColor;
}
</style>
