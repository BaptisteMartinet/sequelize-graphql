export function camelize(str: string) {
  return str.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2) {
    if (p2 !== undefined) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}
