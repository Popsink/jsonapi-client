import { IJsonApiData, IJsonApiRelated } from "./types.d";

/**
 * Deserialize the json:api data.
 */
export default class JsonApiDeserializer {
  /**
   * Instanciate the deserializer.
   *
   * @param data - data to deserialize
   * @param included - included json:api array
   * @param includeQueryParams - include query parameter like 'authors,tags,authors.adress'...
   * @param depth - used internally.
   */
  constructor(
    private data: IJsonApiData,
    private included: IJsonApiData[],
    private includeQueryParams: string,
    private lineage: string = ""
  ) {}

  /** Return the deserialized data. */
  deserialize() {
    return {
      id: this.data.id,
      type: this.data.type,
      ...this.data.attributes,
      ...this.relatedAttributes(),
    };
  }

  /** Return the related fields as related or included resources. */
  private relatedAttributes() {
    const result: any = {};
    if (!this.data.relationships) return result;

    for (const [name, related] of Object.entries(this.data.relationships)) {
      if (Array.isArray(related.data)) {
        result[name] = related.data.map((data) =>
          this.findResource(name, data)
        );
      } else {
        result[name] = this.findResource(name, related.data);
      }
    }
    return result;
  }

  /**
   * Include the real resource if needed, or return its related version.
   *
   * @param relatedName
   * @param related
   */
  private findResource(relatedName: string, related: IJsonApiRelated | null) {
    if (!related) return null;
    if (!this.shouldBeIncluded(relatedName)) return related;

    const data = this.include(relatedName, related);
    return new JsonApiDeserializer(
      data,
      this.included,
      this.includeQueryParams,
      this.getRelatedLineage(relatedName)
    ).deserialize();
  }

  /**
   * include a resource, found from the included array.
   *
   * @param relatedName - the related resource name.
   * @param related - the related resource.
   */
  private include(relatedName: string, related: IJsonApiRelated): IJsonApiData {
    const result = this.included.find((item) => item.id === related.id);
    if (!result)
      throw new Error(
        `Resource '${related.type}' from '${this.data.type}' as '${relatedName}' should be included but is not found.` +
          ` Include query param: "${this.includeQueryParams}"`
      );
    return result;
  }

  /**
   * Return true if the current related item should include the shared resource.
   *
   * @param relatedName - related resource name.
   */
  private shouldBeIncluded(relatedName: string) {
    return !!this.lineages.includes(this.getRelatedLineage(relatedName));
  }

  /**
   * Return the related lineage (like 'articles.authors.adresses' for 'adresses')
   *
   * @param relatedName - related resource name.
   */
  private getRelatedLineage(relatedName: string) {
    return [this.lineage, relatedName].filter(Boolean).join(".");
  }

  /**
   * Convert the include query param into a list of strings.
   *
   * Example:
   * - 'authors,authors.adresses,tags' -> [['authors'], ['authors.adresses'], ['tags']]
   */
  private get lineages() {
    const includes = this.includeQueryParams.split(",");
    return includes.map((item) => item.replace("__", "."));
  }
}
