<template>
	<v-drawer
		v-model="internalActive"
		class="modal"
		:title="t('editing_image')"
		persistent
		@cancel="internalActive = false"
	>
		<template #activator="activatorBinding">
			<slot name="activator" v-bind="activatorBinding" />
		</template>

		<template #subtitle>
			<span class="warning">{{ t('changes_are_permanent') }}</span>
		</template>

		<div v-if="loading" class="loader">
			<v-progress-circular indeterminate />
		</div>

		<v-notice v-else-if="error" type="error">error</v-notice>

		<div v-show="imageData && !loading && !error" class="editor-container">
			<div class="editor">
				<img ref="imageElement" :src="imageURL" role="presentation" alt="" @load="onImageLoad" />
			</div>

			<div class="toolbar">
				<div
					v-tooltip.top.inverted="t('drag_mode')"
					class="drag-mode toolbar-button"
					@click="dragMode = dragMode === 'crop' ? 'move' : 'crop'"
				>
					<v-icon name="pan_tool" :class="{ active: dragMode === 'move' }" />
					<v-icon name="crop" :class="{ active: dragMode === 'crop' }" />
				</div>

				<v-icon v-tooltip.top.inverted="t('rotate')" name="rotate_90_degrees_ccw" clickable @click="rotate" />

				<v-icon
					v-tooltip.top.inverted="t('flip_horizontal')"
					name="flip_horizontal"
					clickable
					@click="flip('horizontal')"
				/>

				<v-icon v-tooltip.top.inverted="t('flip_vertical')" name="flip_vertical" clickable @click="flip('vertical')" />

				<v-menu placement="top" show-arrow>
					<template #activator="{ toggle }">
						<v-icon v-tooltip.top.inverted="t('aspect_ratio')" :name="aspectRatioIcon" clickable @click="toggle" />
					</template>

					<v-list>
						<v-list-item clickable :active="aspectRatio === 16 / 9" @click="aspectRatio = 16 / 9">
							<v-list-item-icon><v-icon name="crop_16_9" /></v-list-item-icon>
							<v-list-item-content>16:9</v-list-item-content>
						</v-list-item>
						<v-list-item clickable :active="aspectRatio === 3 / 2" @click="aspectRatio = 3 / 2">
							<v-list-item-icon><v-icon name="crop_3_2" /></v-list-item-icon>
							<v-list-item-content>3:2</v-list-item-content>
						</v-list-item>
						<v-list-item clickable :active="aspectRatio === 5 / 4" @click="aspectRatio = 5 / 4">
							<v-list-item-icon><v-icon name="crop_5_4" /></v-list-item-icon>
							<v-list-item-content>5:4</v-list-item-content>
						</v-list-item>
						<v-list-item clickable :active="aspectRatio === 7 / 5" @click="aspectRatio = 7 / 5">
							<v-list-item-icon><v-icon name="crop_7_5" /></v-list-item-icon>
							<v-list-item-content>7:5</v-list-item-content>
						</v-list-item>
						<v-list-item clickable :active="aspectRatio === 1 / 1" @click="aspectRatio = 1 / 1">
							<v-list-item-icon><v-icon name="crop_square" /></v-list-item-icon>
							<v-list-item-content>{{ t('square') }}</v-list-item-content>
						</v-list-item>
						<v-list-item clickable :active="aspectRatio === NaN" @click="aspectRatio = NaN">
							<v-list-item-icon><v-icon name="crop_free" /></v-list-item-icon>
							<v-list-item-content>{{ t('free') }}</v-list-item-content>
						</v-list-item>
						<v-list-item
							v-if="imageData"
							clickable
							:active="aspectRatio === imageData.width / imageData.height"
							@click="aspectRatio = imageData.width / imageData.height"
						>
							<v-list-item-icon><v-icon name="crop_original" /></v-list-item-icon>
							<v-list-item-content>{{ t('original') }}</v-list-item-content>
						</v-list-item>
					</v-list>
				</v-menu>

				<div class="spacer" />

				<v-icon v-tooltip.top.inverted="t('reset')" name="restart_alt" clickable @click="reset" />

				<div v-if="imageData" class="dimensions">
					{{ n(imageData.width) }}x{{ n(imageData.height) }}
					<template v-if="imageData.width !== newDimensions.width || imageData.height !== newDimensions.height">
						->
						{{ n(newDimensions.width) }}x{{ n(newDimensions.height) }}
					</template>
				</div>

				<button v-show="cropping" class="toolbar-button cancel" @click="cropping = false">
					{{ t('cancel_crop') }}
				</button>
			</div>
		</div>

		<template #actions>
			<v-button v-tooltip.bottom="t('save')" :loading="saving" icon rounded @click="save">
				<v-icon name="check" />
			</v-button>
		</template>
	</v-drawer>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, ref, watch, computed, reactive, nextTick } from 'vue';
import api from '@/api';

import Cropper from 'cropperjs';
import { nanoid } from 'nanoid';
import throttle from 'lodash/throttle';
import { unexpectedError } from '@/utils/unexpected-error';
import { addTokenToURL } from '@/api';
import { getRootPath } from '@/utils/get-root-path';

type Image = {
	type: string;
	filesize: number;
	filename_download: string;
	width: number;
	height: number;
};

export default defineComponent({
	props: {
		id: {
			type: String,
			required: true,
		},
		modelValue: {
			type: Boolean,
			default: undefined,
		},
	},
	emits: ['update:modelValue', 'refresh'],
	setup(props, { emit }) {
		const { t, n } = useI18n();

		const localActive = ref(false);

		const internalActive = computed({
			get() {
				return props.modelValue === undefined ? localActive.value : props.modelValue;
			},
			set(newActive: boolean) {
				localActive.value = newActive;
				emit('update:modelValue', newActive);
			},
		});

		const { loading, error, imageData, imageElement, save, saving, fetchImage, onImageLoad } = useImage();

		const {
			cropperInstance,
			initCropper,
			flip,
			rotate,
			reset,
			aspectRatio,
			aspectRatioIcon,
			newDimensions,
			dragMode,
			cropping,
		} = useCropper();

		watch(internalActive, (isActive) => {
			if (isActive === true) {
				fetchImage();
			} else {
				if (cropperInstance.value) {
					cropperInstance.value.destroy();
				}

				loading.value = false;
				error.value = null;
				imageData.value = null;
			}
		});

		const imageURL = computed(() => {
			return addTokenToURL(`${getRootPath()}assets/${props.id}?${nanoid()}`);
		});

		return {
			t,
			n,
			internalActive,
			loading,
			error,
			imageData,
			imageElement,
			save,
			onImageLoad,
			flip,
			rotate,
			reset,
			aspectRatio,
			aspectRatioIcon,
			saving,
			imageURL,
			newDimensions,
			dragMode,
			cropping,
		};

		function useImage() {
			const loading = ref(false);
			const error = ref(null);
			const imageData = ref<Image | null>(null);
			const saving = ref(false);

			const imageElement = ref<HTMLImageElement | null>(null);

			return {
				loading,
				error,
				imageData,
				saving,
				fetchImage,
				imageElement,
				save,
				onImageLoad,
			};

			async function fetchImage() {
				try {
					loading.value = true;

					const response = await api.get(`/files/${props.id}`, {
						params: {
							fields: ['type', 'filesize', 'filename_download', 'width', 'height'],
						},
					});

					imageData.value = response.data.data;
				} catch (err: any) {
					error.value = err;
				} finally {
					loading.value = false;
				}
			}

			function save() {
				saving.value = true;

				cropperInstance.value
					?.getCroppedCanvas({
						imageSmoothingQuality: 'high',
					})
					.toBlob(async (blob) => {
						if (blob === null) {
							saving.value = false;
							return;
						}

						const formData = new FormData();
						formData.append('file', blob, imageData.value?.filename_download);

						try {
							await api.patch(`/files/${props.id}`, formData);
							emit('refresh');
							internalActive.value = false;
						} catch (err: any) {
							unexpectedError(err);
						} finally {
							saving.value = false;
						}
					}, imageData.value?.type);
			}

			async function onImageLoad() {
				await nextTick();
				initCropper();
			}
		}

		function useCropper() {
			const cropperInstance = ref<Cropper | null>(null);

			const localAspectRatio = ref(NaN);

			const newDimensions = reactive({
				width: null as null | number,
				height: null as null | number,
			});

			watch(imageData, () => {
				if (!imageData.value) return;
				localAspectRatio.value = imageData.value.width / imageData.value.height;
				newDimensions.width = imageData.value.width;
				newDimensions.height = imageData.value.height;
			});

			const aspectRatio = computed<number>({
				get() {
					return localAspectRatio.value;
				},
				set(newAspectRatio) {
					localAspectRatio.value = newAspectRatio;
					cropperInstance.value?.setAspectRatio(newAspectRatio);
					cropperInstance.value?.crop();
					dragMode.value = 'crop';
				},
			});

			const aspectRatioIcon = computed(() => {
				if (!imageData.value) return 'crop_original';

				switch (aspectRatio.value) {
					case 16 / 9:
						return 'crop_16_9';
					case 3 / 2:
						return 'crop_3_2';
					case 5 / 4:
						return 'crop_5_4';
					case 7 / 5:
						return 'crop_7_5';
					case 1 / 1:
						return 'crop_square';
					case imageData.value.width / imageData.value.height:
						return 'crop_original';
					default:
						return 'crop_free';
				}
			});

			const localDragMode = ref<'move' | 'crop'>('move');

			const dragMode = computed({
				get() {
					return localDragMode.value;
				},
				set(newMode: 'move' | 'crop') {
					cropperInstance.value?.setDragMode(newMode);
					localDragMode.value = newMode;

					if (newMode === 'move') {
						cropperInstance.value?.clear();
						localCropping.value = false;
					}
				},
			});

			const localCropping = ref(false);
			const cropping = computed({
				get() {
					return localCropping.value;
				},
				set(newCropping: boolean) {
					if (newCropping === false) {
						cropperInstance.value?.clear();
					}

					localCropping.value = newCropping;
				},
			});

			return {
				cropperInstance,
				initCropper,
				flip,
				rotate,
				reset,
				aspectRatio,
				aspectRatioIcon,
				newDimensions,
				dragMode,
				cropping,
			};

			function initCropper() {
				if (imageElement.value === null) return;

				if (cropperInstance.value) {
					cropperInstance.value.destroy();
				}

				localCropping.value = false;

				cropperInstance.value = new Cropper(imageElement.value, {
					autoCrop: false,
					autoCropArea: 0.5,
					toggleDragModeOnDblclick: false,
					dragMode: 'move',
					viewMode: 1,
					crop: throttle((event) => {
						if (!imageData.value) return;

						if (cropping.value === false && (event.detail.width || event.detail.height)) {
							cropping.value = true;
						}

						const newWidth = event.detail.width || imageData.value.width;
						const newHeight = event.detail.height || imageData.value.height;

						if (event.detail.rotate === 0 || event.detail.rotate === -180) {
							newDimensions.width = Math.round(newWidth);
							newDimensions.height = Math.round(newHeight);
						} else {
							newDimensions.height = Math.round(newWidth);
							newDimensions.width = Math.round(newHeight);
						}
					}, 50),
				});
			}

			function flip(type: 'horizontal' | 'vertical') {
				if (type === 'vertical') {
					if (cropperInstance.value?.getData().scaleX === -1) {
						cropperInstance.value?.scaleX(1);
					} else {
						cropperInstance.value?.scaleX(-1);
					}
				}

				if (type === 'horizontal') {
					if (cropperInstance.value?.getData().scaleY === -1) {
						cropperInstance.value?.scaleY(1);
					} else {
						cropperInstance.value?.scaleY(-1);
					}
				}
			}

			function rotate() {
				cropperInstance.value?.rotate(-90);
			}

			function reset() {
				cropperInstance.value?.reset();
				dragMode.value = 'move';
			}
		}
	},
});
</script>

<style lang="scss" scoped>
.modal {
	--v-drawer-content-padding-small: 0px;
	--v-drawer-content-padding: 0px;
}

.editor-container {
	width: 100%;
	height: calc(100% - (65px + 24px + 24px)); /* header height + 2x margin */
	overflow: hidden;
	background-color: var(--background-subdued);

	.editor {
		flex-grow: 1;
		width: 100%;
		height: calc(100% - 60px);
	}

	img {
		/* Cropper JS will handle this */
		opacity: 0;
	}
}

.loader {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.toolbar {
	display: flex;
	align-items: center;
	width: 100%;
	height: 60px;
	padding: 0 24px;
	color: var(--white);
	background-color: #263238;

	.v-icon {
		display: inline-block;
		margin-right: 16px;
	}
}

.spacer {
	flex-grow: 1;
}

.dimensions {
	margin-right: 12px;
	color: var(--foreground-subdued);
	font-feature-settings: 'tnum';
}

.warning {
	color: var(--warning);
}

.toolbar-button {
	padding: 8px;
	background-color: rgb(255 255 255 / 0.2);
	border-radius: var(--border-radius);
	cursor: pointer;
	transition: background-color var(--fast) var(--transition);

	&:hover {
		background-color: rgb(255 255 255 / 0.15);
	}
}

.drag-mode {
	margin-right: 16px;
	margin-left: -8px;

	.v-icon {
		margin-right: 0;
		opacity: 0.5;

		&.active {
			opacity: 1;
		}
	}

	.v-icon:first-child {
		margin-right: 8px;
	}
}

.cancel {
	padding-right: 16px;
	padding-left: 16px;
}
</style>
