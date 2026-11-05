/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Wraps `lines` in `// @generated` markers, indenting every non-empty line. */
function generatedBlock(tag, indent, lines) {
  return [`// @generated begin ${tag}`, ...lines, `// @generated end ${tag}`]
    .map(line => (line ? indent + line : line))
    .join('\n');
}

/**
 * Replaces the block tagged `tag` in place, or calls `insert` when the file
 * has none. Running `expo prebuild` without `--clean` reuses the native
 * project, so this keeps a second run from adding a duplicate block.
 */
function upsertGeneratedBlock(contents, tag, block, insert) {
  const markers = new RegExp(
    `^[ \\t]*// @generated begin ${escapeRegExp(tag)}$[\\s\\S]*?` +
      `^[ \\t]*// @generated end ${escapeRegExp(tag)}$`,
    'm'
  );
  if (markers.test(contents)) {
    return contents.replace(markers, () => block);
  }
  return insert(contents, block);
}

module.exports = { generatedBlock, upsertGeneratedBlock };
