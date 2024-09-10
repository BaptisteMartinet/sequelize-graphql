import type { Model } from '@definitions/index';

// https://gist.github.com/codeguy/6684588?permalink_comment_id=4325476#gistcomment-4325476
export function slugify(str: string) {
  return str
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\_/g, '-') // Replace _ with -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/\-$/g, ''); // Remove trailing -
}

/**
 * Given an arbitrary resource name and Model, returns a unique slug, safe for use in URLs as resource identifier.
 * The slug will be count based (eg. A resource named "potato" will become "potato-2", "potato-3", etc if inserted multiple times).
 */
export async function genSlug(
  resourceName: string,
  model: Model<any>,
  opts: {
    /** @default slugBase */
    slugBaseColumnName?: string;
  } = {},
) {
  const { slugBaseColumnName = 'slugBase' } = opts;
  const slugBase = slugify(resourceName);
  const slubBaseOccurences = await model.model.count({
    where: { [slugBaseColumnName]: slugBase },
  });
  const slug = slugBase + (slubBaseOccurences > 0 ? `-${slubBaseOccurences + 1}` : '');
  return { slugBase, slug };
}
