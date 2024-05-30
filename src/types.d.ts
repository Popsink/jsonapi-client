/** Simple related field. */
export type IJsonApiRelated = {
  id: string;
  type: string;
};

/** Data of a created resource. */
export type IJsonApiCreateData = {
  type: string;
  attributes: {
    [key: string]: any;
  };
  relationships?: {
    [key: string]: { data: IJsonApiRelated | IJsonApiRelated[] | null };
  };
};

/** Data of a already created resource. */
export type IJsonApiData = IJsonApiCreateData & {
  id: string;
};

/** Deserialized resource. */
export type IDeserializedJsonApiData<T extends {}> = T & {
  id: string;
  type: string;
};

/** Deserialized json:api response. */
export type IDeserializedResponseData<T> = {
  data: IDeserializedJsonApiData<T>;
  included: IJsonApiData[];
  meta: { pagination: { page: number; pages: number; count: number } };
  links: { first: string; last: string; next: string; prev: string };
  relationships: {
    [resource: string]: {
      data: IDeserializedJsonApiData | IDeserializedJsonApiData[];
      meta?: { count: number };
    };
  };
};

/** Detail response. */
export type IJsonApiDetail = {
  data: IJsonApiData;
  included: IJsonApiData[];
  meta: any;
};

/** List response. */
export type IJsonApiList = {
  data: IJsonApiData[];
  included: IJsonApiData[];
  meta: any;
  links: any;
};

/** Json api error response.
 *
 * doc: https://jsonapi.org/format/#errors
 */
export type IJsonApiErrorResponse = {
  data: {
    errors: IJsonApiError[];
  };
};

/** Define a Json:API error. */
export type IJsonApiError = {
  detail: string;
  status: number;
  source: { pointer: string };
  code: string;
};

/** Configuration for our personal API. */
export type IApiConfig = {
  /** Callback on Error. */
  onError?: ({ response }: { response: IJsonApiErrorResponse }) => void;
};
