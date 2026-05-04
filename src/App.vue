<script setup>
import { useTheme } from 'vuetify'
import navConfig from './navConfig.json'

const theme = useTheme()
function toggleTheme() {
	theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<template>
	<v-app>
		<v-app-bar elevation="1" color="primary">
			<v-app-bar-title>SMTP Inbound Controls</v-app-bar-title>
			<template #append>
				<v-btn icon class="mr-1" @click="toggleTheme">
					<v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
				</v-btn>
			</template>
		</v-app-bar>

		<v-navigation-drawer permanent width="300">
			<v-list density="compact" nav open-all>
				<v-list-group v-for="group in navConfig" :key="group.label" :value="group.label">
					<template #activator="{ props }">
						<v-list-item v-bind="props" :title="group.label" class="text-body-medium" />
					</template>
					<v-list-item
						v-for="item in group.items"
						:key="item.route"
						:to="'/' + item.route"
						class="text-body-small"
					>
						<v-list-item-title class="font-weight-regular" style="white-space: normal">{{ item.title }}</v-list-item-title>
					</v-list-item>
				</v-list-group>
			</v-list>
		</v-navigation-drawer>

		<v-main>
			<v-container fluid>
				<router-view :key="$route.path" />
			</v-container>
		</v-main>
	</v-app>
</template>
