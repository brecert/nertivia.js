interface CollectionObject<K> {
    id: K;
}
interface AddParams {
    /**
     * if the object should replace an already inserted object
     */
    replace?: boolean;
}
export declare class Collection<K, V extends CollectionObject<K>> extends Map<K, V> {
    add<I extends V>(obj: I, { replace }?: AddParams): I;
    find<S extends V>(predicate: (value: V, index: number, obj: this) => value is V): V | undefined;
    every(callbackfn: (value: V, index: number, array: this) => unknown): boolean;
    some(callbackfn: (value: V, index: number, array: this) => unknown): boolean;
    remove(obj: V): V | null;
}
export {};
//# sourceMappingURL=collection.d.ts.map