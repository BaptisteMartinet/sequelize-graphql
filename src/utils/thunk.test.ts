import { unthunk } from './thunk';

describe('unthunk', () => {
  it('should unthunk scalar value', () => {
    const scalar = 42;
    expect(unthunk(scalar)).toBe(42);
  });

  it('should unthunk function value', () => {
    const func = () => 42;
    expect(unthunk(func)).toBe(42);
  });

  it('should unthunk function object', () => {
    const funcObj = function () {
      return { a: 1, b: 2 };
    };
    expect(unthunk(funcObj)).toEqual({ a: 1, b: 2 });
  });
});
