import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
	base: '/apps/smtpinctrl.nsf/',
	plugins: [vue(), vuetify({ autoImport: true })],
	server: {
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			'/apps/smtpinctrl.nsf/api.xsp/': {
				target: 'http://localhost',
				changeOrigin: true,
				ws: true,
			}
		}
	},
})