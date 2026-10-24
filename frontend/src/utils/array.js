// Сравнивает два массива id как множества (без учёта порядка и типа элементов).
export function sameIdSet(a, b) {
    if (a.length !== b.length) return false;
    const set = new Set(a.map(String));
    return b.every((id) => set.has(String(id)));
}
