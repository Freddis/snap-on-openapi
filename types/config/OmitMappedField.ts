// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OmitMappedField<TMap extends Record<string, any>, T extends string> = {
  [key in keyof TMap]: Omit<TMap[key], T>
}
