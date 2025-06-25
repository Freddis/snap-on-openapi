import {ISpecificationExtension} from './ISpecificationExtension';

export interface Info extends ISpecificationExtension {
  title: string;
  description?: string;
  termsOfService?: string;
  version: string;
};
