type IExtensionName = `x-${string}`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IExtensionType = any;
export type ISpecificationExtension = {
    [extensionName: IExtensionName]: IExtensionType;
};
