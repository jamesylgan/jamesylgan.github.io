#!/usr/bin/env node
/**
 * Audit script: validates settings infrastructure for the Task Tracker.
 * Checks DEFAULT_SETTINGS, ALL_SETTINGS_ROWS, settingsOrder consistency,
 * parent chain integrity, and new-key injection logic.
 *
 * Usage: node test/audit-settings.cjs
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

// ── 1. Extract constants and DEFAULT_SETTINGS ───────────────────────────────
console.log('\n── DEFAULT_SETTINGS ──');

// Extract prerequisite constants
const labelsMatch = html.match(/const DEFAULT_LABELS\s*=\s*(\{[\s\S]*?\n\});/);
const priMatch = html.match(/const DEFAULT_PRIORITY_LEVELS\s*=\s*(\[[\s\S]*?\]);/);
const sizeMatch = html.match(/const DEFAULT_SIZE_LEVELS\s*=\s*(\[[\s\S]*?\]);/);
assert(labelsMatch, 'Could not extract DEFAULT_LABELS');
assert(priMatch, 'Could not extract DEFAULT_PRIORITY_LEVELS');
assert(sizeMatch, 'Could not extract DEFAULT_SIZE_LEVELS');

let DEFAULT_LABELS, DEFAULT_PRIORITY_LEVELS, DEFAULT_SIZE_LEVELS;
try {
    DEFAULT_LABELS = eval('(' + labelsMatch[1] + ')');
    DEFAULT_PRIORITY_LEVELS = eval(priMatch[1]);
    DEFAULT_SIZE_LEVELS = eval(sizeMatch[1]);
} catch (e) {
    console.error('Failed to eval constants:', e.message);
    process.exit(1);
}

const defaultSettingsMatch = html.match(/const DEFAULT_SETTINGS\s*=\s*\{([\s\S]*?)\n\};/);
assert(defaultSettingsMatch, 'Could not extract DEFAULT_SETTINGS');
let DEFAULT_SETTINGS;
try {
    DEFAULT_SETTINGS = eval('({' + defaultSettingsMatch[1] + '})');
} catch (e) {
    console.error('Failed to eval DEFAULT_SETTINGS:', e.message);
    process.exit(1);
}

assert(typeof DEFAULT_SETTINGS === 'object', 'DEFAULT_SETTINGS is an object');
assert(typeof DEFAULT_SETTINGS.settingsOrder === 'object', 'settingsOrder exists in defaults');
assert(Array.isArray(DEFAULT_SETTINGS.settingsOrder), 'settingsOrder is an array');

// ── 2. Extract ALL_SETTINGS_ROWS ────────────────────────────────────────────
console.log('── ALL_SETTINGS_ROWS ──');

const allRowsMatch = html.match(/const ALL_SETTINGS_ROWS\s*=\s*\[([\s\S]*?)\n\];/);
assert(allRowsMatch, 'Could not extract ALL_SETTINGS_ROWS');

// We need to eval with settings in scope (for showIf lambdas)
const settings = { ...DEFAULT_SETTINGS };
let ALL_SETTINGS_ROWS;
try {
    ALL_SETTINGS_ROWS = eval('[' + allRowsMatch[1] + ']');
} catch (e) {
    console.error('Failed to eval ALL_SETTINGS_ROWS:', e.message);
    process.exit(1);
}

assert(Array.isArray(ALL_SETTINGS_ROWS), 'ALL_SETTINGS_ROWS is an array');
assert(ALL_SETTINGS_ROWS.length > 20, `ALL_SETTINGS_ROWS has ${ALL_SETTINGS_ROWS.length} entries (expected >20)`);

// ── 3. Every row key is unique ──────────────────────────────────────────────
console.log('── Key Uniqueness ──');

const rowKeys = ALL_SETTINGS_ROWS.map(r => r.key);
const dupes = rowKeys.filter((k, i) => rowKeys.indexOf(k) !== i);
assert(dupes.length === 0, `Duplicate keys in ALL_SETTINGS_ROWS: ${dupes.join(', ')}`);

// ── 4. Every toggle row has an id ───────────────────────────────────────────
console.log('── Toggle IDs ──');

ALL_SETTINGS_ROWS.filter(r => r.type === 'toggle').forEach(r => {
    assert(r.id, `Toggle '${r.key}' missing id`);
});

// Toggle IDs are unique
const toggleIds = ALL_SETTINGS_ROWS.filter(r => r.type === 'toggle' && r.id).map(r => r.id);
const idDupes = toggleIds.filter((id, i) => toggleIds.indexOf(id) !== i);
assert(idDupes.length === 0, `Duplicate toggle ids: ${idDupes.join(', ')}`);

// ── 5. Parent chain integrity ───────────────────────────────────────────────
console.log('── Parent Chains ──');

ALL_SETTINGS_ROWS.filter(r => r.parent).forEach(r => {
    const parentRow = ALL_SETTINGS_ROWS.find(p => p.key === r.parent);
    assert(parentRow, `'${r.key}' has parent '${r.parent}' which does not exist in ALL_SETTINGS_ROWS`);
});

// No circular parent chains
function getDepth(row, visited) {
    if (!row.parent) return 0;
    if (visited.has(row.key)) return -1; // circular
    visited.add(row.key);
    const parent = ALL_SETTINGS_ROWS.find(r => r.key === row.parent);
    if (!parent) return -1;
    return 1 + getDepth(parent, visited);
}
ALL_SETTINGS_ROWS.filter(r => r.parent).forEach(r => {
    const depth = getDepth(r, new Set());
    assert(depth >= 0, `Circular parent chain detected for '${r.key}'`);
    assert(depth <= 3, `Excessive nesting depth (${depth}) for '${r.key}'`);
});

// ── 6. settingsOrder contains all row keys ──────────────────────────────────
console.log('── settingsOrder Completeness ──');

const defaultOrder = DEFAULT_SETTINGS.settingsOrder;
const missingFromOrder = rowKeys.filter(k => !defaultOrder.includes(k));
assert(missingFromOrder.length === 0, `Keys missing from default settingsOrder: ${missingFromOrder.join(', ')}`);

const extraInOrder = defaultOrder.filter(k => !rowKeys.includes(k));
assert(extraInOrder.length === 0, `Extra keys in settingsOrder not in ALL_SETTINGS_ROWS: ${extraInOrder.join(', ')}`);

// ── 7. settingsOrder has no duplicates ──────────────────────────────────────
const orderDupes = defaultOrder.filter((k, i) => defaultOrder.indexOf(k) !== i);
assert(orderDupes.length === 0, `Duplicate keys in settingsOrder: ${orderDupes.join(', ')}`);

// ── 8. Children follow parents in settingsOrder ─────────────────────────────
console.log('── settingsOrder Parent-Before-Child ──');

function getTopParent(row) {
    let cur = row;
    while (cur.parent) {
        const p = ALL_SETTINGS_ROWS.find(r => r.key === cur.parent);
        if (!p) break;
        cur = p;
    }
    return cur.key;
}

ALL_SETTINGS_ROWS.filter(r => r.parent).forEach(r => {
    const childIdx = defaultOrder.indexOf(r.key);
    const parentIdx = defaultOrder.indexOf(r.parent);
    if (childIdx >= 0 && parentIdx >= 0) {
        assert(childIdx > parentIdx, `'${r.key}' (idx ${childIdx}) appears before its parent '${r.parent}' (idx ${parentIdx}) in settingsOrder`);
    }
});

// ── 9. Every toggle key has a default value in DEFAULT_SETTINGS ─────────────
console.log('── Default Values ──');

ALL_SETTINGS_ROWS.filter(r => r.type === 'toggle').forEach(r => {
    assert(DEFAULT_SETTINGS[r.key] !== undefined, `Toggle '${r.key}' has no default value in DEFAULT_SETTINGS`);
    assert(typeof DEFAULT_SETTINGS[r.key] === 'boolean', `Toggle '${r.key}' default should be boolean, got ${typeof DEFAULT_SETTINGS[r.key]}`);
});

ALL_SETTINGS_ROWS.filter(r => r.type === 'slider').forEach(r => {
    assert(DEFAULT_SETTINGS[r.key] !== undefined, `Slider '${r.key}' has no default value in DEFAULT_SETTINGS`);
    const opts = r.options.split(',');
    assert(opts.includes(DEFAULT_SETTINGS[r.key]), `Slider '${r.key}' default '${DEFAULT_SETTINGS[r.key]}' not in options: ${r.options}`);
});

// ── 10. getOrderedRows injection simulation ─────────────────────────────────
console.log('── getOrderedRows New-Key Injection ──');

// Simulate a saved order missing new keys (like a real user upgrade)
const staleOrder = ['dueDates','inlineDate','resetInlineDate','priority','inlinePriority',
    'resetInlinePriority','priorityColors','sizing','inlineSize','resetInlineSize',
    'notes','inlineNotes','links','categories','categoryTracker','repeat','inlineRepeat',
    'resetInlineRepeat','progress','groupStatus','nextTasks','customColumns','darkMode',
    'archive','trash','skipTrash','sessionTrash','dismissAction','dateFormat','dataSection',
    'resetSettings','advancedMenu','colorScheme','visualMode','encryption','buttonReorder',
    'yamlEditor','clearAllData'];

// Re-implement the injection logic from getOrderedRows to test it in isolation
{
    const order = [...staleOrder];
    ALL_SETTINGS_ROWS.forEach(r => {
        if (order.includes(r.key)) return;
        if (r.parent) {
            let ancKey = r.parent;
            while (ancKey && !order.includes(ancKey)) {
                const ancRow = ALL_SETTINGS_ROWS.find(p => p.key === ancKey);
                ancKey = ancRow ? ancRow.parent : null;
            }
            if (ancKey) {
                let insertAt = order.indexOf(ancKey) + 1;
                while (insertAt < order.length) {
                    const nextRow = ALL_SETTINGS_ROWS.find(p => p.key === order[insertAt]);
                    if (nextRow && nextRow.parent) {
                        const topKey = getTopParent(nextRow);
                        if (topKey === getTopParent(r)) { insertAt++; continue; }
                    }
                    break;
                }
                order.splice(insertAt, 0, r.key);
            } else {
                order.push(r.key);
            }
        } else {
            const myIdx = ALL_SETTINGS_ROWS.indexOf(r);
            let insertAfterKey = null;
            for (let i = myIdx - 1; i >= 0; i--) {
                if (!ALL_SETTINGS_ROWS[i].parent && order.includes(ALL_SETTINGS_ROWS[i].key)) {
                    insertAfterKey = ALL_SETTINGS_ROWS[i].key;
                    break;
                }
            }
            if (insertAfterKey) {
                let insertAt = order.indexOf(insertAfterKey) + 1;
                while (insertAt < order.length) {
                    const nextRow = ALL_SETTINGS_ROWS.find(p => p.key === order[insertAt]);
                    if (nextRow && nextRow.parent) {
                        const topKey = getTopParent(nextRow);
                        if (topKey === insertAfterKey) { insertAt++; continue; }
                    }
                    break;
                }
                order.splice(insertAt, 0, r.key);
            } else {
                order.push(r.key);
            }
        }
    });

    const newKeys = rowKeys.filter(k => !staleOrder.includes(k));
    console.log(`  New keys injected: ${newKeys.join(', ')}`);

    // All keys should now be in the order
    const allKeysPresent = rowKeys.every(k => order.includes(k));
    assert(allKeysPresent, 'After injection, all ALL_SETTINGS_ROWS keys are in the order');

    // No duplicates
    const injDupes = order.filter((k, i) => order.indexOf(k) !== i);
    assert(injDupes.length === 0, `No duplicates after injection: ${injDupes.join(', ')}`);

    // Children should follow parents
    ALL_SETTINGS_ROWS.filter(r => r.parent).forEach(r => {
        const ci = order.indexOf(r.key);
        const pi = order.indexOf(r.parent);
        assert(ci > pi, `After injection: '${r.key}' (${ci}) should follow '${r.parent}' (${pi})`);
    });

    // New child keys should be near their top parent, not at the end
    newKeys.filter(k => {
        const row = ALL_SETTINGS_ROWS.find(r => r.key === k);
        return row && row.parent;
    }).forEach(k => {
        const row = ALL_SETTINGS_ROWS.find(r => r.key === k);
        const ki = order.indexOf(k);
        const topPar = getTopParent(row);
        const tpi = order.indexOf(topPar);
        assert(ki - tpi < 10, `New child key '${k}' (idx ${ki}) near top parent '${topPar}' (idx ${tpi})`);
    });
}

// ── 11. isEffectivelyHidden / isEffectivelyAdvanced ─────────────────────────
console.log('── Effective Placement Helpers ──');

// When a top parent is hidden, children should be effectively hidden too
const hiddenList = ['nextTasks'];
const advList = [];

const childOfNextTasks = ALL_SETTINGS_ROWS.filter(r => {
    return getTopParent(r) === 'nextTasks' && r.key !== 'nextTasks';
});
assert(childOfNextTasks.length >= 2, `nextTasks has ${childOfNextTasks.length} descendants (expected >=2)`);

// Verify the helpers exist in the HTML
assert(html.includes('function isEffectivelyHidden'), 'isEffectivelyHidden function exists');
assert(html.includes('function isEffectivelyAdvanced'), 'isEffectivelyAdvanced function exists');

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n═══════════════════════════════════════`);
console.log(`  Settings audit: ${passed} passed, ${failed} failed`);
console.log(`═══════════════════════════════════════\n`);

process.exit(failed > 0 ? 1 : 0);
