interface CollectionObject<K> {
	id: K
}

interface AddParams {
	/**
	 * if the object should replace an already inserted object
	 */
	replace?: boolean
}

export class Collection<K, V extends CollectionObject<K>> extends Map<K, V> {
	add<I extends V>(obj: I, { replace = true }: AddParams = {}): I {
		if(this.has(obj.id) && !replace) {
			return obj
		}

		this.set(obj.id, obj)

		return obj
	}

	find<S extends V>(predicate: (value: V, index: number, obj: this) => value is V): V | undefined
	{
		let i = 0
		for (const item of this.values()) {
			if(predicate(item, i, this)) {
				return item
			}

			i++
		}
		return undefined
	}

	every(callbackfn: (value: V, index: number, array: this) => unknown): boolean {
		let i = 0
		for (const item of this.values()) {
			if(!callbackfn(item, i, this)) {
				return false
			}

			i++
		}
		return true
	}

	some(callbackfn: (value: V, index: number, array: this) => unknown): boolean {
		let i = 0
		for (const item of this.values()) {
			if(!callbackfn(item, i, this)) {
				return true
			}

			i++
		}
		return false
	}

	remove(obj: V): V | null {
		const item = this.get(obj.id)
		if(!item) {
			return null;
		}
		this.delete(item.id)
		return item
	}
}