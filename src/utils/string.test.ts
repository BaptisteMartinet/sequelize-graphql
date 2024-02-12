import { camelize } from './string';

describe('camelize', () => {
  const data: Array<[string, string]> = [
    ['hello', 'hello'],
    ['hello world', 'helloWorld'],
    ['hello_world', 'helloWorld'],
    ['hello    world', 'helloWorld']
  ] as const;

  it.each(data)('camelize(%s)', (str, expected) => {
    expect(camelize(str)).toBe(expected);
  });
});
