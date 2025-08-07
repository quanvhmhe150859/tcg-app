export const getOrFetchAndSet = async (key, fetchFn, setter, transformFn = (x) => x) => {
  try {
    const cached = sessionStorage.getItem(key);

    if (cached) {
      const parsed = JSON.parse(cached);
      setter(transformFn(parsed));
      return;
    }

    const result = await fetchFn();
    const transformed = transformFn(result);
    sessionStorage.setItem(key, JSON.stringify(result));
    setter(transformed);
  } catch (err) {
    console.error(`getOrFetchAndSet(${key}) failed:`, err);
    sessionStorage.removeItem(key);
  }
};