/**
 * localStorage-based storage.
 * shared:true uses a "shared_" prefix.
 * All data persists in the browser across refreshes.
 */

const PREFIX = "ns_";

function getKey(key, shared) {
  return (shared ? "shared_" : "") + PREFIX + key;
}

export const storage = {
  async get(key, shared = false) {
    try {
      const val = localStorage.getItem(getKey(key, shared));
      if (val === null) return null;
      return { key, value: val, shared: !!shared };
    } catch { return null; }
  },
  async set(key, value, shared = false) {
    try {
      localStorage.setItem(getKey(key, shared), value);
      return { key, value, shared: !!shared };
    } catch { return null; }
  },
  async delete(key, shared = false) {
    try {
      localStorage.removeItem(getKey(key, shared));
      return { key, deleted: true };
    } catch { return null; }
  },
  async list(prefix = "", shared = false) {
    try {
      const full = getKey(prefix, shared);
      const keys = Object.keys(localStorage).filter(k => k.startsWith(full));
      return { keys, prefix, shared: !!shared };
    } catch { return { keys: [], prefix, shared: !!shared }; }
  },
};
