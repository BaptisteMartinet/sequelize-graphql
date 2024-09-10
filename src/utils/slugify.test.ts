import { slugify } from './slugify';

describe('slugify', () => {
  const data: Array<[string, string]> = [
    ['potato', 'potato'],
    ['potato potato', 'potato-potato'],
    ['  potato   potato', 'potato-potato'],
    ['potato-potato', 'potato-potato'],
    ['Émile Zola', 'emile-zola'],
    [
      'Some quite long sentence with multiple, words!',
      'some-quite-long-sentence-with-multiple-words',
    ],
  ] as const;

  it.each(data)('slugify(%s)', (str, expected) => {
    expect(slugify(str)).toBe(expected);
  });
});
