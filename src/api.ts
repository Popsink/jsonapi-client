import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import JsonApiDeserializer from "./deserializer";
import {
  IApiConfig,
  IJsonApiDetail,
  IJsonApiList,
  IDeserializedResponseData,
  IJsonApiCreateData,
  IJsonApiData,
} from "./types.d";

export default class JsonApiService {
  public axios: AxiosInstance;
  public globalApiConfig: IApiConfig;
  public globalQueryParams: any;
  private authToken: string | undefined;

  constructor({
    baseURL,
    authToken,
    globalApiConfig,
  }: {
    baseURL: string;
    authToken?: string;
    globalApiConfig?: IApiConfig;
  }) {
    this.axios = axios.create({ baseURL });
    this.globalQueryParams = {};
    this.globalApiConfig = globalApiConfig || {};
    this.authToken = authToken;

    this.insertBaseInterceptor();
    this.insertErrorInterceptor();
  }

  /** Call this method to set a new authentication token. */
  public setAuthToken(value: string | undefined) {
    this.authToken = value;
  }

  /** handle content-type and authorization Bearer token. */
  private insertBaseInterceptor() {
    this.axios.interceptors.request.use((config) => {
      config.params = config.params || {};
      config.headers["Content-Type"] = "application/vnd.api+json";
      if (process.env.NODE_ENV === "test") {
        config.headers["Access-Control-Allow-Credentials"] = true;
      }
      if (this.authToken) {
        config.headers["Authorization"] = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  /** Insert the error interceptor. */
  private insertErrorInterceptor() {
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          process.env.NODE_ENV === "test" ||
          process.env.NODE_ENV === "development"
        ) {
          console.error(
            "Json:API service error:",
            error.response?.data?.errors || error.response?.statusText,
            error.config.url
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /** Request and deserialize a json:api response. */
  public async request<T>(config: AxiosRequestConfig, apiConfig?: IApiConfig) {
    apiConfig = apiConfig || {};
    apiConfig = { ...this.globalApiConfig, ...apiConfig };
    let response: AxiosResponse<IJsonApiDetail | IJsonApiList | null>;
    config = {
      ...config,
      params: { ...this.globalQueryParams, ...config.params },
    };
    try {
      response = await this.axios.request<IJsonApiDetail | IJsonApiList | null>(
        config
      );
    } catch (err: any) {
      if (err.response) {
        if (apiConfig?.onError) {
          apiConfig.onError({ response: err.response });
        }
      }
      throw err;
    }
    if (process.env.NODE_ENV === "development") console.log(response);

    const included = response.data?.included || [];
    const data = response.data?.data;
    const include = config.params?.include || "";
    if (!data || !response.data) return response as AxiosResponse<null>;
    else if (Array.isArray(data)) {
      response.data.data = data.map((data) => {
        const relationships = data?.relationships;
        return {
          ...new JsonApiDeserializer(data, included, include).deserialize(),
          ...relationships,
        };
      });
    } else {
      const relationships = data?.relationships;
      response.data.data = {
        ...new JsonApiDeserializer(data, included, include).deserialize(),
        ...relationships,
      };
    }
    return response as AxiosResponse<IDeserializedResponseData<T>>;
  }

  /** Create a resource. */
  public async create<T>(
    url: string,
    data: { data: IJsonApiCreateData },
    params: any = {},
    apiConfig?: IApiConfig
  ) {
    const response = await this.request(
      {
        url,
        method: "POST",
        data,
        params,
      },
      apiConfig
    );
    return response.data as IDeserializedResponseData<T>;
  }

  /** Mutate a resource. */
  public async post<T>(
    url: string,
    data: { data: IJsonApiCreateData },
    params: any = {},
    apiConfig?: IApiConfig
  ) {
    const response = await this.request(
      {
        url,
        method: "POST",
        data,
        params,
      },
      apiConfig
    );
    return response.data as IDeserializedResponseData<T>;
  }

  /** List a resource. */
  public async list<T>(url: string, params: any = {}, apiConfig?: IApiConfig) {
    const response = await this.request(
      {
        url,
        method: "GET",
        params,
      },
      apiConfig
    );
    return response.data as IDeserializedResponseData<T[]>;
  }

  /** Get a resource. */
  public async get<T>(url: string, params: any = {}, apiConfig?: IApiConfig) {
    const response = await this.request(
      {
        url,
        method: "GET",
        params,
      },
      apiConfig
    );
    return response.data as IDeserializedResponseData<T>;
  }

  /** Update a resource. */
  public async update<T>(
    url: string,
    data: { data: IJsonApiData },
    params: any = {},
    apiConfig?: IApiConfig
  ) {
    const response = await this.request(
      {
        url,
        method: "PATCH",
        data,
        params,
      },
      apiConfig
    );
    return response.data as IDeserializedResponseData<T>;
  }

  /** Remove a resource. */
  public async remove(url: string, params: any = {}, apiConfig?: IApiConfig) {
    const response = await this.request(
      {
        url,
        method: "DELETE",
        params,
      },
      apiConfig
    );
    return response.data as null;
  }
}
