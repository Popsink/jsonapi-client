import JsonApiService from "./api";
import JsonApiDeserializer from "./deserializer";
export {
  IApiConfig,
  IJsonApiDetail,
  IJsonApiList,
  IDeserializedResponseData,
  IJsonApiCreateData,
  IJsonApiData,
} from "./types.d";
export default JsonApiService;
export { JsonApiDeserializer };
