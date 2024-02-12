import { getEnumCleanObj } from './enum';

describe('getEnumEntries', () => {
  it('should not have duplicate numbers keys', () => {
    enum RoleEnum {
      Manager,
      Admin,
    }
    expect(getEnumCleanObj(RoleEnum)).toEqual({ Manager: 0, Admin: 1 });
  });

  it('should not have duplicate strings keys', () => {
    enum RoleEnumStr {
      Manager = 'Manager',
      Admin = 'Admin',
    }
    expect(getEnumCleanObj(RoleEnumStr)).toEqual({ Manager: 'Manager', Admin: 'Admin' });
  });

  it('should have incremental values', () => {
    enum NumBaseEnum {
      Manager = 2,
      Admin,
    }
    expect(getEnumCleanObj(NumBaseEnum)).toEqual({ Manager: 2, Admin: 3 });
  });

  it('should respect values and not have duplicate keys', () => {
    enum NumEnum {
      Manager = 2,
      Admin = 42,
    }
    expect(getEnumCleanObj(NumEnum)).toEqual({ Manager: 2, Admin: 42 });
  });

  it('shoud not have weird duplicates keys', () => {
    enum WeirdEnum {
      _Val1 = '2',
      '1f' = -3,
    }
    expect(getEnumCleanObj(WeirdEnum)).toEqual({ _Val1: '2', '1f': -3 });
  });
});
