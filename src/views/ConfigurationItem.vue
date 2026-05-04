<script setup>
import { ref, computed, onMounted } from 'vue'
import moment from 'moment'

const props = defineProps({
	title: { type: String, required: true },
	description: { type: String, default: '' },
	itemName: { type: String, required: true },
	valueTitle: { type: String, default: 'Host' }
})

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

const entries = ref([])
const loading = ref(false)
const loadError = ref(null)
const sortBy = ref([{ key: 'Value', order: 'asc' }])
const selected = ref([])

const dialogOpen = ref(false)
const dialogMode = ref('edit')
const editingEntry = ref(null)
const form = ref({ main: '', Expire: '', Comment: '' })
const valueError = ref(false)
const saveError = ref(null)
const saving = ref(false)
const deleting = ref(false)
const deleteError = ref(null)

const headers = computed(() => [
	{ title: props.valueTitle, key: 'Value', sortable: true },
	{ title: 'Comment', key: 'Comment', sortable: false },
	{ title: 'Expire', key: 'Expire', sortable: false },
	{ title: 'Created', key: 'Created', sortable: true },
	{ title: 'Modified', key: 'Modified', sortable: true },
])

function formatDate(iso) {
	if (!iso) return ''
	const m = moment(iso)
	return m.isValid() ? m.format('YYYY-MM-DD HH:mm') : iso
}

function formatDateOnly(iso) {
	if (!iso) return ''
	const m = moment(iso)
	return m.isValid() ? m.format('YYYY-MM-DD') : iso
}

async function loadEntries() {
	loading.value = true
	loadError.value = null
	try {
		const res = await fetch(`${API_BASE}/list/${props.itemName}`)
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		const data = await res.json()
		entries.value = data.entries ?? []
	} catch (e) {
		loadError.value = e.message
	} finally {
		loading.value = false
	}
}

function openEdit(item) {
	form.value = {
		main: item.Value ?? '',
		Expire: item.Expire ? moment(item.Expire).format('YYYY-MM-DD') : '',
		Comment: item.Comment ?? '',
	}
	editingEntry.value = item
	dialogMode.value = 'edit'
	valueError.value = false
	saveError.value = null
	dialogOpen.value = true
}

function openNew() {
	form.value = { main: '', Expire: '', Comment: '' }
	editingEntry.value = null
	dialogMode.value = 'new'
	valueError.value = false
	saveError.value = null
	dialogOpen.value = true
}

function closeDialog() {
	dialogOpen.value = false
}

async function save() {
	if (!form.value.main.trim()) {
		valueError.value = true
		return
	}
	saving.value = true
	saveError.value = null

	const payload = {
		Value: form.value.main.trim(),
		Expire: form.value.Expire || null,
		Comment: form.value.Comment,
	}

	try {
		let res
		if (dialogMode.value === 'edit') {
			res = await fetch(
				`${API_BASE}/document/${props.itemName}/unid/${editingEntry.value['@unid']}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				}
			)
		} else {
			res = await fetch(`${API_BASE}/document/${props.itemName}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
		}
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		dialogOpen.value = false
		await loadEntries()
	} catch (e) {
		saveError.value = e.message
	} finally {
		saving.value = false
	}
}

async function deleteSelected() {
	if (!selected.value.length) return
	deleting.value = true
	deleteError.value = null
	try {
		const results = await Promise.allSettled(
			selected.value.map(unid =>
				fetch(`${API_BASE}/document/${props.itemName}/unid/${unid}`, { method: 'DELETE' })
					.then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`) })
			)
		)
		const failed = results.filter(r => r.status === 'rejected')
		if (failed.length) deleteError.value = `${failed.length} deletion(s) failed`
		selected.value = []
		await loadEntries()
	} finally {
		deleting.value = false
	}
}

onMounted(loadEntries)
</script>

<template>
	<v-card class="mb-6">
		<v-card-title class="d-flex align-center pa-4 text-body-large" style="gap: 8px">
			<div class="flex-grow-1" style="min-width: 0; white-space: normal">
				<div class="text-headline-small">{{ title }}</div>
				<p v-if="description" class="text-body-medium text-medium-emphasis mt-2 mb-0" style="white-space: pre-line">{{ description }}</p>
			</div>
			<v-btn variant="flat" color="primary" prepend-icon="mdi-plus" @click="openNew">
				New
			</v-btn>
		</v-card-title>

		<v-divider />


		<v-alert v-if="loadError" type="error" variant="tonal" closable class="ma-4">
			Failed to load: {{ loadError }}
		</v-alert>

		<v-data-table v-model="selected" :headers="headers" :items="entries" v-model:sort-by="sortBy" :loading="loading"
			show-select item-value="@unid"
			:row-props="({ item }) => ({ onClick: () => openEdit(item), style: `cursor: pointer${item.Active === false ? '; opacity: 0.4' : ''}` })" hover>
			<template #item.Comment="{ item }">
				<span style="display: block; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ (item.Comment ?? '').replace(/[\n\r]/g, ' ') }}</span>
			</template>
			<template #item.Expire="{ item }">{{ formatDateOnly(item.Expire) }}</template>
			<template #item.Created="{ item }">{{ formatDate(item.Created) }}</template>
			<template #item.Modified="{ item }">{{ formatDate(item.Modified) }}</template>
		</v-data-table>

		<v-divider />

		<v-card-actions class="pa-3">
			<v-btn color="error" variant="tonal" prepend-icon="mdi-delete" size="small"
				:disabled="!selected.length || deleting" :loading="deleting" @click="deleteSelected">
				Delete{{ selected.length ? ` (${selected.length})` : '' }}
			</v-btn>
			<v-alert v-if="deleteError" type="error" variant="tonal" density="compact" class="ml-3 py-1"
				style="flex: 1">
				{{ deleteError }}
			</v-alert>
		</v-card-actions>
	</v-card>

	<!-- Edit / New dialog -->
	<v-dialog v-model="dialogOpen" max-width="520" persistent>
		<v-card>
			<v-card-title class="text-h6 pa-4">
				{{ dialogMode === 'edit' ? 'Edit Rule' : 'New Rule' }}
			</v-card-title>

			<v-divider />

			<v-card-text class="pt-4">
				<v-row dense>
					<!-- Server: edit mode only, read-only -->
					<v-col v-if="dialogMode === 'edit'" cols="12">
						<v-text-field label="Server" :model-value="editingEntry?.Server.replace(/^CN=/, '').replace(/\/[A-Z]+?=/, '/')" variant="outlined"
							density="compact" readonly />
					</v-col>

					<!-- Main field (Address / Host) -->
					<v-col cols="12">
						<v-text-field v-model="form.main" :label="`${props.valueTitle} *`"
							:placeholder="props.valueTitle === 'Address' ? 'e.g. example.com or user@example.com' : 'e.g. mail.example.com or [10.0.0.1]'"
							variant="outlined" density="compact"
							:error-messages="valueError ? [`${props.valueTitle} is required`] : []"
							@update:model-value="valueError = false" />
					</v-col>

					<!-- Comment -->
					<v-col cols="12">
						<v-textarea v-model="form.Comment" label="Comment" variant="outlined" density="compact" rows="3"
							auto-grow />
					</v-col>

					<!-- Expire -->
					<v-col cols="12">
						<v-text-field v-model="form.Expire" label="Expire" type="date" variant="outlined"
							density="compact" clearable />
					</v-col>
				</v-row>

				<v-alert v-if="saveError" type="error" variant="tonal" density="compact" class="mt-3">
					{{ saveError }}
				</v-alert>
			</v-card-text>

			<template v-if="dialogMode === 'edit'">
				<v-divider />
				<v-card-text class="py-2 text-body-small text-medium-emphasis">
					<div class="pb-1">Created: {{ formatDate(editingEntry?.Created) }}<template v-if="editingEntry?.CreatedBy"> by {{ editingEntry.CreatedBy.replace(/^CN=/, '').replace(/\/[A-Z]+?=/, '/') }}</template></div>
					<div>Modified: {{ formatDate(editingEntry?.Modified) }}<template v-if="editingEntry?.ModifiedBy"> by {{ editingEntry.ModifiedBy.replace(/^CN=/, '').replace(/\/[A-Z]+?=/, '/') }}</template></div>
				</v-card-text>
			</template>

			<v-divider />

			<v-card-actions class="pa-4">
				<v-spacer />
				<v-btn :disabled="saving" @click="closeDialog">Cancel</v-btn>
				<v-btn color="primary" variant="flat" :loading="saving" @click="save">Save</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
