
interface ObjectConstructor {
    entries <T extends string, V>(obj: Record<T, V>): [T, V][]
}
