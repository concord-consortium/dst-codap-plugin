export interface CodapCollectionResponse {
  attrs?: CodapAttribute[];
  [key: string]: any;
}

export interface CodapApiResult {
  success: boolean;
  values?: CodapCollectionResponse | CodapAttribute[] | CodapDataContext[] | CodapCase[];
}

export interface CodapAttribute {
  name: string;
  stats?: {
    min: number;
    max: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CodapRequest {
  action: string;
  resource: string;
  values?: any;
}

export interface CodapDataContext {
  name: string;
  title?: string;
  description?: string;
  collections?: CodapCollection[];
  [key: string]: any;
}

export interface CodapCollection {
  name: string;
  title?: string;
  description?: string;
  attrs?: CodapAttribute[];
  [key: string]: any;
}

export interface CodapCase {
  values: {
    [key: string]: any;
  };
  [key: string]: any;
}

export function isCollectionResponse(value: any): value is CodapCollectionResponse {
  return value && typeof value === 'object' && 'attrs' in value;
}

export function isAttributeArray(value: any): value is CodapAttribute[] {
  return Array.isArray(value) && value.length > 0 && 'name' in value[0];
}

export function isDataContextArray(value: any): value is CodapDataContext[] {
  return Array.isArray(value) && value.length > 0 && 'name' in value[0];
}

export function isCaseArray(value: any): value is CodapCase[] {
  return Array.isArray(value) && value.length > 0 && 'values' in value[0];
} 