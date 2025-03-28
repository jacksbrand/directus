<template>
	<private-view :title="t('settings_permissions')">
		<template #headline><v-breadcrumb :items="[{ name: t('settings'), to: '/settings' }]" /></template>

		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="admin_panel_settings" />
			</v-button>
		</template>

		<template #actions>
			<v-button v-tooltip.bottom="t('create_role')" rounded icon :to="addNewLink">
				<v-icon name="add" />
			</v-button>
		</template>

		<template #navigation>
			<settings-navigation />
		</template>

		<template #sidebar>
			<sidebar-detail icon="info_outline" :title="t('information')" close>
				<div v-md="t('page_help_settings_roles_collection')" class="page-description" />
			</sidebar-detail>
		</template>

		<div class="roles">
			<v-table
				v-model:headers="tableHeaders"
				show-resize
				:items="roles"
				fixed-header
				item-key="id"
				:loading="loading"
				@click:row="navigateToRole"
			>
				<template #[`item.icon`]="{ item }">
					<v-icon class="icon" :name="item.icon" :class="{ public: item.public }" />
				</template>

				<template #[`item.name`]="{ item }">
					<v-text-overflow :text="item.name" class="name" :class="{ public: item.public }" />
				</template>

				<template #[`item.count`]="{ item }">
					<value-null v-if="item.public" />
				</template>

				<template #[`item.description`]="{ item }">
					<v-text-overflow :text="item.description" class="description" />
				</template>
			</v-table>
		</div>
		<router-view name="add" />
	</private-view>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, computed, ref } from 'vue';
import SettingsNavigation from '../../components/navigation.vue';

import api from '@/api';
import { Header as TableHeader } from '@/components/v-table/types';
import ValueNull from '@/views/private/components/value-null';
import { useRouter } from 'vue-router';
import { unexpectedError } from '@/utils/unexpected-error';
import { translate } from '@/utils/translate-object-values';
import { Role } from '@directus/shared/types';

type RoleItem = Partial<Role> & {
	count?: number;
};

export default defineComponent({
	name: 'RolesCollection',
	components: { SettingsNavigation, ValueNull },
	props: {},
	setup() {
		const { t } = useI18n();

		const router = useRouter();

		const roles = ref<RoleItem[]>([]);
		const loading = ref(false);

		const lastAdminRoleId = computed(() => {
			const adminRoles = roles.value.filter((role) => role.admin_access === true);
			return adminRoles.length === 1 ? adminRoles[0].id : null;
		});

		const tableHeaders = ref<TableHeader[]>([
			{
				text: '',
				value: 'icon',
				sortable: false,
				width: 42,
				align: 'left',
				description: null,
			},
			{
				text: t('name'),
				value: 'name',
				sortable: false,
				width: 200,
				align: 'left',
				description: null,
			},
			{
				text: t('users'),
				value: 'count',
				sortable: false,
				width: 140,
				align: 'left',
				description: null,
			},
			{
				text: t('description'),
				value: 'description',
				sortable: false,
				width: 470,
				align: 'left',
				description: null,
			},
		]);

		fetchRoles();

		const addNewLink = computed(() => {
			return `/settings/roles/+`;
		});

		return { t, loading, roles, tableHeaders, addNewLink, navigateToRole };

		async function fetchRoles() {
			loading.value = true;

			try {
				const response = await api.get(`/roles`, {
					params: {
						limit: -1,
						fields: ['id', 'name', 'description', 'icon', 'admin_access', 'users'],
						deep: {
							users: {
								_aggregate: { count: 'id' },
								_groupBy: ['role'],
								_sort: 'role',
								_limit: -1,
							},
						},
						sort: 'name',
					},
				});

				roles.value = [
					{
						public: true,
						name: t('public_label'),
						icon: 'public',
						description: t('public_description'),
						id: 'public',
					},
					...response.data.data.map((role: any) => {
						return {
							...translate(role),
							count: role.users[0]?.count.id || 0,
						};
					}),
				];
			} catch (err: any) {
				unexpectedError(err);
			} finally {
				loading.value = false;
			}
		}

		function navigateToRole({ item }: { item: Role }) {
			if (item.id !== 'public' && lastAdminRoleId.value) {
				router.push({
					name: 'settings-roles-item',
					params: { primaryKey: item.id, lastAdminRoleId: lastAdminRoleId.value },
				});
			} else {
				router.push(`/settings/roles/${item.id}`);
			}
		}
	},
});
</script>

<style lang="scss" scoped>
.header-icon {
	--v-button-color-disabled: var(--primary);
	--v-button-background-color-disabled: var(--primary-10);
}

.roles {
	padding: var(--content-padding);
	padding-top: 0;
	padding-bottom: var(--content-padding-bottom);
}

.system {
	--v-icon-color: var(--primary);

	color: var(--primary);
}

.description {
	color: var(--foreground-subdued);
}

.public {
	--v-icon-color: var(--primary);

	color: var(--primary);
}
</style>
