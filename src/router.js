import { createRouter, createWebHashHistory } from 'vue-router'
import ConfigurationItem from './views/ConfigurationItem.vue'
import navConfig from './navConfig.json'

const items = navConfig.flatMap(group => group.items)

const routes = [
	{ path: '/', redirect: items[0].path },
	...items.map(({ path, ...props }) => ({
		path,
		component: ConfigurationItem,
		props,
	})),
]

export default createRouter({
	history: createWebHashHistory(),
	routes,
})
