#!/usr/bin/env node
/**
 * Audit script: validates feature completeness for the Task Tracker.
 * Checks that all features have proper settings, UI elements, rendering,
 * and action handlers wired up correctly.
 *
 * Usage: node test/audit-features.cjs
 * Run from the task-tracker directory.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const htmlPath = path.join(ROOT, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

let passed = 0;
let failed = 0;
function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  FAIL: ${msg}`); }
}

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const script = scriptMatch[1];
const bodyHtml = html.match(/<body>([\s\S]*?)<script>/)[1] || '';

// ── Helper: check function exists ───────────────────────────────────────────
function fnExists(name) {
    return new RegExp(`function ${name}\\s*\\(`).test(script);
}

// ── Helper: check HTML element exists ───────────────────────────────────────
function elementExists(idOrClass) {
    return html.includes(`id="${idOrClass}"`) || html.includes(`class="${idOrClass}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Task CRUD
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n── Feature: Task CRUD ──');

assert(fnExists('addTask'), 'addTask function exists');
assert(fnExists('toggleTask'), 'toggleTask function exists');
assert(fnExists('deleteTask'), 'deleteTask function exists');
assert(fnExists('openEditModal'), 'openEditModal function exists');
assert(fnExists('saveEdit'), 'saveEdit function exists');
assert(fnExists('closeEditModal'), 'closeEditModal function exists');
assert(elementExists('editModal'), 'Edit modal element exists');
assert(elementExists('editTitle'), 'editTitle input exists');
assert(elementExists('editTaskId'), 'editTaskId hidden input exists');
assert(elementExists('editGroupId'), 'editGroupId hidden input exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Group CRUD
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Group CRUD ──');

assert(fnExists('addGroup'), 'addGroup function exists');
assert(fnExists('deleteGroup'), 'deleteGroup function exists');
assert(fnExists('editGroup'), 'editGroup function exists');
assert(fnExists('saveGroupEdit'), 'saveGroupEdit function exists');
assert(fnExists('archiveGroup'), 'archiveGroup function exists');
assert(fnExists('restoreGroup'), 'restoreGroup function exists');
assert(elementExists('editGroupModal'), 'Edit group modal element exists');
assert(elementExists('newGroupName'), 'New group name input exists');
assert(elementExists('groupsContainer'), 'Groups container element exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Due Dates
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Due Dates ──');

assert(script.includes("settings.dueDates"), 'dueDates setting checked in code');
assert(elementExists('editDueDate'), 'editDueDate input exists');
assert(elementExists('editDueDateWrap'), 'editDueDateWrap container exists');
assert(script.includes("dueClass === 'overdue'"), 'Overdue class logic exists');
assert(script.includes("dueClass === 'due-soon'") || script.includes("dueClass = 'due-soon'"), 'Due-soon class logic exists');
assert(html.includes('.overdue') || html.includes('overdue'), 'Overdue CSS class referenced');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Priority
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Priority ──');

assert(script.includes("settings.priority"), 'priority setting checked in code');
assert(elementExists('editPriority'), 'editPriority select exists');
assert(elementExists('editPriorityWrap'), 'editPriorityWrap container exists');
assert(script.includes('priorityLevels'), 'priorityLevels referenced');
assert(html.includes('priority-high'), 'priority-high CSS class');
assert(html.includes('priority-medium'), 'priority-medium CSS class');
assert(html.includes('priority-low'), 'priority-low CSS class');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Repeating Tasks
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Repeating Tasks ──');

assert(script.includes("settings.repeat"), 'repeat setting checked in code');
assert(fnExists('getNextRepeatDate'), 'getNextRepeatDate function exists');
assert(fnExists('backfillRepeatingTasks'), 'backfillRepeatingTasks function exists');
assert(fnExists('formatRepeat'), 'formatRepeat function exists');
assert(elementExists('editRepeat'), 'editRepeat select exists');
assert(elementExists('editRepeatDays'), 'editRepeatDays container exists');
assert(script.includes('repeatHistory'), 'repeatHistory referenced');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Notes
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Notes ──');

assert(script.includes("settings.notes"), 'notes setting checked in code');
assert(elementExists('editNotes'), 'editNotes textarea exists');
assert(elementExists('editNotesWrap'), 'editNotesWrap container exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Archive / Trash
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Archive / Trash ──');

assert(fnExists('archiveTask'), 'archiveTask function exists');
assert(fnExists('restoreTask'), 'restoreTask function exists');
assert(fnExists('renderArchived'), 'renderArchived function exists');
assert(fnExists('renderTrash'), 'renderTrash function exists');
assert(fnExists('purgeExpiredTrash'), 'purgeExpiredTrash function exists');
assert(fnExists('restoreFromTrash'), 'restoreFromTrash function exists');
assert(fnExists('emptyTrash'), 'emptyTrash function exists');
assert(elementExists('archivedView'), 'archivedView element exists');
assert(elementExists('trashView'), 'trashView element exists');
assert(elementExists('trashTab'), 'trashTab element exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Categories
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Categories ──');

assert(script.includes("settings.categories"), 'categories setting checked');
assert(fnExists('groupHasCategories'), 'groupHasCategories function exists');
assert(fnExists('renderTasksByCategory'), 'renderTasksByCategory function exists');
assert(elementExists('editCategory'), 'editCategory select exists');
assert(elementExists('editCategoryWrap'), 'editCategoryWrap container exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Custom Columns
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Custom Columns ──');

assert(script.includes("settings.customColumns"), 'customColumns setting checked');
assert(fnExists('renderTaskColumned'), 'renderTaskColumned function exists');
assert(fnExists('renderColumnEditor'), 'renderColumnEditor function exists');
assert(fnExists('initColumnResize'), 'initColumnResize function exists');
assert(elementExists('editCustomFieldsWrap'), 'editCustomFieldsWrap container exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Next TODOs
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Next TODOs ──');

assert(script.includes("settings.nextTasks"), 'nextTasks setting checked');
assert(fnExists('renderNextTasks'), 'renderNextTasks function exists');
assert(fnExists('addToNextTasks'), 'addToNextTasks function exists');
assert(fnExists('removeFromNextTasks'), 'removeFromNextTasks function exists');
assert(fnExists('toggleNextTask'), 'toggleNextTask function exists');
assert(fnExists('initNextTasksDragDrop'), 'initNextTasksDragDrop function exists');
assert(elementExists('nextTasksSection'), 'nextTasksSection element exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Next TODOs Click-to-Scroll
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Click-to-Scroll ──');

assert(script.includes("settings.nextTasksScroll"), 'nextTasksScroll setting checked');
assert(script.includes("settings.nextTasksScrollMode"), 'nextTasksScrollMode setting checked');
assert(fnExists('scrollToTask'), 'scrollToTask function exists');
assert(script.includes("scrollToTask("), 'scrollToTask called in render');
assert(html.includes('task-highlight'), 'task-highlight CSS class defined');
assert(html.includes('@keyframes taskHighlight'), 'taskHighlight animation defined');

// Verify both modes are wired
assert(script.includes("nextTasksScrollMode === 'click'"), 'Click mode check exists');
assert(script.includes("nextTasksScrollMode === 'button'"), 'Button mode check exists');
assert(script.includes('btn-scroll-to'), 'Scroll button class referenced');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Group Reordering
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Group Reordering ──');

assert(script.includes("settings.groupReorder"), 'groupReorder setting checked');
assert(script.includes("settings.groupReorderCollapse"), 'groupReorderCollapse setting checked');
assert(fnExists('toggleGroupReorder'), 'toggleGroupReorder function exists');
assert(fnExists('initGroupDragDrop'), 'initGroupDragDrop function exists');
assert(elementExists('groupReorderBtn'), 'groupReorderBtn element exists');
assert(html.includes('group-reorder-toggle'), 'group-reorder-toggle CSS class defined');
assert(html.includes('group-dragging'), 'group-dragging CSS class defined');
assert(html.includes('group-drag-over'), 'group-drag-over CSS class defined');

// Verify reorder mode persists after drop
assert(script.includes('if (groupReorderMode)'), 'Reorder mode reapplied after save');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Images
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Images ──');

assert(script.includes("settings.images"), 'images setting checked');
assert(fnExists('handleImageUpload'), 'handleImageUpload function exists');
assert(fnExists('compressImage'), 'compressImage function exists');
assert(fnExists('renderEditImagePreviews'), 'renderEditImagePreviews function exists');
assert(fnExists('removeEditImage'), 'removeEditImage function exists');
assert(fnExists('openImageLightbox'), 'openImageLightbox function exists');
assert(elementExists('editImagesWrap'), 'editImagesWrap container exists');
assert(elementExists('imageUploadArea'), 'imageUploadArea element exists');
assert(elementExists('imageFileInput'), 'imageFileInput element exists');
assert(elementExists('imagePreviewList'), 'imagePreviewList element exists');
assert(elementExists('imageLightbox'), 'imageLightbox element exists');
assert(html.includes('task-image-thumb'), 'task-image-thumb CSS class defined');
assert(html.includes('image-lightbox'), 'image-lightbox CSS class defined');

// Images in both renderers
assert((script.match(/task\.images/g) || []).length >= 3, 'task.images checked in multiple places (renderTask + renderTaskColumned + saveEdit)');

// Image compression targets
assert(script.includes('500 * 1024'), 'Image compression targets ~500KB');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Progress Tracking
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Progress Tracking ──');

assert(script.includes("settings.progress"), 'progress setting checked');
assert(fnExists('renderProgress'), 'renderProgress function exists');
assert(fnExists('renderGroupProgress'), 'renderGroupProgress function exists');
assert(elementExists('progressFill'), 'progressFill element exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Links
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Links ──');

assert(script.includes("settings.links"), 'links setting checked');
assert(fnExists('parseLinkValue'), 'parseLinkValue function exists');
assert(fnExists('buildLinkValue'), 'buildLinkValue function exists');
assert(fnExists('sanitizeHref'), 'sanitizeHref function exists');
assert(elementExists('editLink'), 'editLink input exists');
assert(elementExists('editLinkWrap'), 'editLinkWrap container exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Sizing
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Sizing ──');

assert(script.includes("settings.sizing"), 'sizing setting checked');
assert(elementExists('editSize'), 'editSize select exists');
assert(elementExists('editSizingWrap'), 'editSizingWrap container exists');
assert(html.includes('size-badge'), 'size-badge CSS class defined');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Dark Mode
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Dark Mode ──');

assert(fnExists('applyDarkMode'), 'applyDarkMode function exists');
assert(html.includes('[data-theme="dark"]'), 'Dark mode CSS variables defined');
assert(script.includes("settings.darkMode"), 'darkMode setting checked');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Encryption
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Encryption ──');

assert(script.includes("settings.encryption"), 'encryption setting checked');
assert(script.includes('crypto.subtle') || script.includes('cryptoKey'), 'Encryption API usage found');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Export / Import
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Export / Import ──');

assert(fnExists('exportJSON'), 'exportJSON function exists');
assert(fnExists('importJSON'), 'importJSON function exists');
assert(fnExists('exportSettings'), 'exportSettings function exists');
assert(fnExists('importSettings'), 'importSettings function exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Undo
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Undo ──');

assert(fnExists('undo'), 'undo function exists');
assert(script.includes('undoStack'), 'undoStack referenced');
assert(script.includes('Ctrl+Z') || script.includes('ctrlKey') || script.includes('metaKey'), 'Keyboard shortcut handling exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Tabs
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Tabs ──');

assert(fnExists('switchTab'), 'switchTab function exists');
assert(elementExists('activeView'), 'activeView element exists');
assert(elementExists('archivedView'), 'archivedView element exists');
assert(elementExists('trashView'), 'trashView element exists');

// ══════════════════════════════════════════════════════════════════════════════
// Feature: Settings Infrastructure
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Feature: Settings Infrastructure ──');

assert(fnExists('openSettings'), 'openSettings function exists');
assert(fnExists('closeSettings'), 'closeSettings function exists');
assert(fnExists('saveSetting'), 'saveSetting function exists');
assert(fnExists('renderSettingsMenu'), 'renderSettingsMenu function exists');
assert(fnExists('applySettings'), 'applySettings function exists');
assert(fnExists('toggleOrganizeMode'), 'toggleOrganizeMode function exists');
assert(fnExists('cycleSettingPlacement'), 'cycleSettingPlacement function exists');
assert(fnExists('getOrderedRows'), 'getOrderedRows function exists');
assert(fnExists('getTopParent'), 'getTopParent function exists');
assert(fnExists('isEffectivelyHidden'), 'isEffectivelyHidden function exists');
assert(fnExists('isEffectivelyAdvanced'), 'isEffectivelyAdvanced function exists');
assert(elementExists('settingsOverlay') || html.includes('settingsOverlay'), 'Settings overlay exists');

// ══════════════════════════════════════════════════════════════════════════════
// Security: XSS prevention
// ══════════════════════════════════════════════════════════════════════════════
console.log('── Security: XSS Prevention ──');

// Verify esc() is used for user-content rendering
const escUsages = (script.match(/esc\(/g) || []).length;
assert(escUsages > 30, `esc() called ${escUsages} times (expected >30 for adequate XSS protection)`);

// sanitizeHref blocks dangerous protocols
assert(script.includes("javascript:"), 'sanitizeHref explicitly checks javascript: protocol');

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n═══════════════════════════════════════`);
console.log(`  Features audit: ${passed} passed, ${failed} failed`);
console.log(`═══════════════════════════════════════\n`);

process.exit(failed > 0 ? 1 : 0);
