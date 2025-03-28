import ExportSidebarDetail from '@/views/private/components/export-sidebar-detail.vue';
import RenderDisplay from '@/views/private/components/render-display';
import RenderTemplate from '@/views/private/components/render-template';
import SidebarDetail from '@/views/private/components/sidebar-detail/';
import UserPopover from '@/views/private/components/user-popover';
import ValueNull from '@/views/private/components/value-null';
import DocsWrapper from '@/views/private/components/docs-wrapper';
import { App } from 'vue';
import TransitionBounce from './transition/bounce';
import TransitionDialog from './transition/dialog';
import TransitionExpand from './transition/expand';
import VAvatar from './v-avatar/';
import VBadge from './v-badge/';
import VBreadcrumb from './v-breadcrumb';
import VButton from './v-button/';
import VCard, { VCardActions, VCardSubtitle, VCardText, VCardTitle } from './v-card';
import VCheckbox from './v-checkbox/';
import VCheckboxTree from './v-checkbox-tree/';
import VChip from './v-chip/';
import VDetail from './v-detail';
import VDialog from './v-dialog';
import VDivider from './v-divider';
import VDrawer from './v-drawer/';
import VError from './v-error';
import VFancySelect from './v-fancy-select';
import VFieldTemplate from './v-field-template';
import VFieldList from './v-field-list/v-field-list.vue';
import VForm from './v-form';
import VHover from './v-hover/';
import VHighlight from './v-highlight.vue';
import VIcon from './v-icon/';
import VIconFile from './v-icon-file.vue';
import VInfo from './v-info/';
import VInput from './v-input/';
import VItemGroup, { VItem } from './v-item-group';
import VList, { VListGroup, VListItem, VListItemContent, VListItemHint, VListItemIcon } from './v-list/';
import VMenu from './v-menu/';
import VNotice from './v-notice/';
import VOverlay from './v-overlay/';
import VPagination from './v-pagination/';
import VProgressCircular from './v-progress/circular/';
import VProgressLinear from './v-progress/linear/';
import VRadio from './v-radio/';
import VSelect from './v-select/';
import VSheet from './v-sheet/';
import VSkeletonLoader from './v-skeleton-loader/';
import VSlider from './v-slider/';
import VSwitch from './v-switch/';
import VTable from './v-table/';
import VTabs, { VTab, VTabItem, VTabsItems } from './v-tabs/';
import VTemplateInput from './v-template-input.vue';
import VTextOverflow from './v-text-overflow.vue';
import VTextarea from './v-textarea';
import VUpload from './v-upload';
import VDatePicker from './v-date-picker';

export function registerComponents(app: App): void {
	app.component('VAvatar', VAvatar);
	app.component('VBadge', VBadge);
	app.component('VBreadcrumb', VBreadcrumb);
	app.component('VButton', VButton);
	app.component('VCardActions', VCardActions);
	app.component('VCardSubtitle', VCardSubtitle);
	app.component('VCardText', VCardText);
	app.component('VCardTitle', VCardTitle);
	app.component('VCard', VCard);
	app.component('VCheckbox', VCheckbox);
	app.component('VCheckboxTree', VCheckboxTree);
	app.component('VChip', VChip);
	app.component('VDetail', VDetail);
	app.component('VDialog', VDialog);
	app.component('VDivider', VDivider);
	app.component('VError', VError);
	app.component('VFancySelect', VFancySelect);
	app.component('VFieldTemplate', VFieldTemplate);
	app.component('VFieldList', VFieldList);
	app.component('VForm', VForm);
	app.component('VHover', VHover);
	app.component('VHighlight', VHighlight);
	app.component('VIcon', VIcon);
	app.component('VIconFile', VIconFile);
	app.component('VInfo', VInfo);
	app.component('VInput', VInput);
	app.component('VItemGroup', VItemGroup);
	app.component('VItem', VItem);
	app.component('VListGroup', VListGroup);
	app.component('VListItemContent', VListItemContent);
	app.component('VListItemHint', VListItemHint);
	app.component('VListItemIcon', VListItemIcon);
	app.component('VListItem', VListItem);
	app.component('VList', VList);
	app.component('VMenu', VMenu);
	app.component('VDrawer', VDrawer);
	app.component('VNotice', VNotice);
	app.component('VOverlay', VOverlay);
	app.component('VPagination', VPagination);
	app.component('VProgressCircular', VProgressCircular);
	app.component('VProgressLinear', VProgressLinear);
	app.component('VRadio', VRadio);
	app.component('VSelect', VSelect);
	app.component('VSheet', VSheet);
	app.component('VSkeletonLoader', VSkeletonLoader);
	app.component('VSlider', VSlider);
	app.component('VSwitch', VSwitch);
	app.component('VTabItem', VTabItem);
	app.component('VTab', VTab);
	app.component('VTable', VTable);
	app.component('VTabsItems', VTabsItems);
	app.component('VTabs', VTabs);
	app.component('VTemplateInput', VTemplateInput);
	app.component('VTextarea', VTextarea);
	app.component('VTextOverflow', VTextOverflow);
	app.component('VUpload', VUpload);
	app.component('VDatePicker', VDatePicker);

	app.component('TransitionBounce', TransitionBounce);
	app.component('TransitionDialog', TransitionDialog);
	app.component('TransitionExpand', TransitionExpand);

	app.component('RenderDisplay', RenderDisplay);
	app.component('RenderTemplate', RenderTemplate);
	app.component('ExportSidebarDetail', ExportSidebarDetail);
	app.component('SidebarDetail', SidebarDetail);
	app.component('UserPopover', UserPopover);
	app.component('ValueNull', ValueNull);
	app.component('DocsWrapper', DocsWrapper);
}
