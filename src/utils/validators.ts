export function hasLength(args: { min?: number; max?: number }) {
  const { min, max } = args;
  return (value: string) => (!min || value.length >= min) && (!max || value.length <= max);
}

export function isBetween(args: { min?: number; max?: number }) {
  const { min, max } = args;
  return (value: number) => (!min || value >= min) && (!max || value <= max);
}

export function isDateBetween(args: {
  min?: Date;
  max?: Date;
  relativeMinYears?: number;
  relativeMaxYears?: number;
}) {
  const { min, max, relativeMinYears, relativeMaxYears } = args;
  return (value: Date) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const minYear = relativeMinYears ? currentYear - relativeMinYears : null;
    const maxYear = relativeMaxYears ? currentYear + relativeMaxYears : null;
    const valueYear = value.getFullYear();
    return (
      (!min || value >= min) &&
      (!max || value <= max) &&
      (!minYear || valueYear >= minYear) &&
      (!maxYear || valueYear <= maxYear)
    );
  };
}

const EmailValidationRegex = /^\S+@\S+\.\S+$/;
export function isEmail() {
  return (value: string) => EmailValidationRegex.test(value);
}
