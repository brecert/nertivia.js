"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Collection extends Map {
    add(obj, { replace = true } = {}) {
        if (this.has(obj.id) && !replace) {
            return obj;
        }
        this.set(obj.id, obj);
        return obj;
    }
    find(predicate) {
        let i = 0;
        for (const item of this.values()) {
            if (predicate(item, i, this)) {
                return item;
            }
            i++;
        }
        return undefined;
    }
    every(callbackfn) {
        let i = 0;
        for (const item of this.values()) {
            if (!callbackfn(item, i, this)) {
                return false;
            }
            i++;
        }
        return true;
    }
    some(callbackfn) {
        let i = 0;
        for (const item of this.values()) {
            if (!callbackfn(item, i, this)) {
                return true;
            }
            i++;
        }
        return false;
    }
    remove(obj) {
        const item = this.get(obj.id);
        if (!item) {
            return null;
        }
        this.delete(item.id);
        return item;
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map