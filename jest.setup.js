// Setup global de Jest (enlazado en jest.config.js → setupFiles).
// AsyncStorage v3 es ESM y nativo: mock en memoria para todos los tests.
// Los tests que necesitan controlar sus respuestas lo vuelven a mockear.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    getItem: jest.fn(async (key) => store.get(key) ?? null),
    setItem: jest.fn(async (key, value) => void store.set(key, value)),
    removeItem: jest.fn(async (key) => void store.delete(key)),
    getAllKeys: jest.fn(async () => [...store.keys()]),
    removeMany: jest.fn(async (keys) => keys.forEach((key) => store.delete(key))),
    clear: jest.fn(async () => store.clear()),
  };
});
