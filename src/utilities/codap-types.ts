export interface CodapCollectionResponse extends Record<string, any> {
  attrs?: CodapAttribute[];
}

export interface CodapApiResult {
  success: boolean;
  values?: CodapCollectionResponse | CodapAttribute[] | CodapDataContext[] | CodapCase[];
}

export interface CodapAttribute extends Record<string, any> {
  name: string;
  stats?: {
    min: number;
    max: number;
    [key: string]: any;
  };
}

export interface CodapRequest {
  action: string;
  resource: string;
  values?: any;
}

export interface CodapDataContext extends Record<string, any> {
  name: string;
  title?: string;
  description?: string;
  collections?: CodapCollection[];
}

export interface CodapCollection extends Record<string, any> {
  name: string;
  title?: string;
  description?: string;
  attrs?: CodapAttribute[];
}

export interface CodapCase extends Record<string, any> {
  values: Record<string, any>;
}

export function isCollectionResponse(value: any): value is CodapCollectionResponse {
  return value && typeof value === "object" && "attrs" in value;
}

export function isAttributeArray(value: any): value is CodapAttribute[] {
  return Array.isArray(value) && value.length > 0 && "name" in value[0];
}

export function isDataContextArray(value: any): value is CodapDataContext[] {
  return Array.isArray(value) && value.length > 0 && "name" in value[0];
}

export function isCaseArray(value: any): value is CodapCase[] {
  return Array.isArray(value) && value.length > 0 && "values" in value[0];
} 
