import type { GraphQLResolveInfo, SelectionNode, FragmentDefinitionNode } from 'graphql';

import assert from 'assert';
import { Kind } from 'graphql';

function descendSelection(
  selections: ReadonlyArray<SelectionNode>,
  selectedFields: Set<string>,
  path: string | null,
  depth: number,
  fragments: Record<string, FragmentDefinitionNode>,
  opts: { maxDepth?: number },
) {
  const { maxDepth } = opts;
  if (maxDepth && depth > maxDepth) return;
  for (const selectionNode of selections) {
    switch (selectionNode.kind) {
      case Kind.FIELD:
        const newPath = depth > 0 ? (path ? path + '.' : '') + selectionNode.name.value : null;
        if (newPath) selectedFields.add(newPath);
        if (selectionNode.selectionSet)
          descendSelection(selectionNode.selectionSet.selections, selectedFields, newPath, depth + 1, fragments, opts);
        break;
      case Kind.INLINE_FRAGMENT:
        descendSelection(selectionNode.selectionSet.selections, selectedFields, path, depth, fragments, opts);
        break;
      case Kind.FRAGMENT_SPREAD:
        const fragmentName = selectionNode.name.value;
        const fragment = fragments[fragmentName];
        assert(fragment, `Unknown fragment: ${fragmentName}`);
        descendSelection(fragment.selectionSet.selections, selectedFields, path, depth, fragments, opts);
        break;
    }
  }
}

/**
 * Given a resolve info object, return the selected fields.
 * @returns A Set containing the selected fields
 * @example
 * GraphQL query:
 * ```gql
 * somePagination {
 *  field1
 *  field2 {
 *    field3
 *  }
 * }
 * ```
 * Result:
 * `[ 'field1', 'field2.field3' ]`
 */
export function getResolveInfoSelectedFields(
  info: GraphQLResolveInfo,
  opts: {
    maxDepth?: number;
  } = {},
) {
  const { fieldNodes, fragments } = info;
  const selectedFields = new Set<string>();
  descendSelection(fieldNodes, selectedFields, null, 0, fragments, opts);
  return selectedFields;
}

/**
 * A getResolveInfoSelectedFields allias that only return the root selection.
 */
export function getResolveInfoSelectedFieldsRoot(info: GraphQLResolveInfo) {
  return getResolveInfoSelectedFields(info, { maxDepth: 1 });
}
