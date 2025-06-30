
interface ObjectConstructor {
    entries <T extends string, V>(obj: Record<T, V>): [T, V][]
    keys<T extends string, V>(obj: Record<T, V>): T[]
}
