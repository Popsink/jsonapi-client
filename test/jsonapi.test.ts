import { IJsonApiData, JsonApiDeserializer } from "../src";

const article: IJsonApiData = {
  id: "article1",
  type: "article",
  attributes: { name: "Learn python in 3 days." },
  relationships: {
    authors: {
      data: [
        { id: "author1", type: "author" },
        { id: "author2", type: "author" },
      ],
    },
    mycolor: {
      data: {
        type: "color",
        id: "color1",
      },
    },
  },
};
const included: IJsonApiData[] = [
  {
    id: "author1",
    type: "author",
    attributes: { name: "aristote" },
    relationships: {
      adresses: { data: [{ id: "adress1", type: "adress" }] },
    },
  },
  {
    id: "author2",
    type: "author",
    attributes: { name: "beyonce" },
    relationships: {
      adresses: { data: [{ id: "adress2", type: "adress" }] },
    },
  },
  {
    id: "color1",
    type: "color",
    attributes: { name: "blue" },
    relationships: {
      createdBy: {
        data: {
          type: "author",
          id: "author1",
        },
      },
    },
  },
  { id: "adress1", type: "adress", attributes: { name: "1 rue du parc" } },
  { id: "adress2", type: "adress", attributes: { name: "2 rue du parc" } },
];

describe("Test the jsonapi deserializer.", () => {
  it("Should deserialize simple data", () => {
    const result = new JsonApiDeserializer(article, [], "").deserialize();
    expect(result.name).toBe("Learn python in 3 days.");
  });

  it("Should deserialize with oneToOne relationships.", () => {
    const result = new JsonApiDeserializer(
      article,
      included,
      "mycolor"
    ).deserialize();
    expect(result.mycolor.name).toBe("blue");
  });

  it("Should deserialize with manyToMany relationship.", () => {
    const result = new JsonApiDeserializer(
      article,
      included,
      "authors"
    ).deserialize();
    expect(result.authors).toContainEqual({
      id: "author1",
      name: "aristote",
      type: "author",
      adresses: [{ id: "adress1", type: "adress" }],
    });
    expect(result.authors).toContainEqual({
      id: "author2",
      name: "beyonce",
      type: "author",
      adresses: [{ id: "adress2", type: "adress" }],
    });
  });

  it("Should deserialize a complexe document.", () => {
    const result = new JsonApiDeserializer(
      article,
      included,
      "authors,authors.adresses,mycolor,mycolor.createdBy"
    ).deserialize();
    expect(result).toMatchObject({
      type: "article",
      id: "article1",
      name: "Learn python in 3 days.",
      authors: [
        {
          id: "author1",
          name: "aristote",
          type: "author",
          adresses: [{ id: "adress1", type: "adress", name: "1 rue du parc" }],
        },
        {
          id: "author2",
          name: "beyonce",
          type: "author",
          adresses: [{ id: "adress2", type: "adress", name: "2 rue du parc" }],
        },
      ],
      mycolor: {
        type: "color",
        id: "color1",
        name: "blue",
        createdBy: { id: "author1", type: "author", name: "aristote" },
      },
    });
  });

  it("Should insert the related fields if no need to include.", () => {
    const result = new JsonApiDeserializer(article, included, "").deserialize();
    expect(result.authors).toContainEqual({ id: "author1", type: "author" });
    expect(result.authors).toContainEqual({ id: "author2", type: "author" });
  });

  it("Should avoid inserting included resource if not needed.", () => {
    let result = new JsonApiDeserializer(
      article,
      included,
      "authors,authors.adresses,mycolor"
    ).deserialize();
    expect(result.mycolor.createdBy.name).not.toBeDefined();

    result = new JsonApiDeserializer(
      article,
      included,
      "mycolor,mycolor.createdBy"
    ).deserialize();
    expect(result.authors).toMatchObject([
      { id: "author1", type: "author" },
      { id: "author2", type: "author" },
    ]);
  });

  it("Should throw an error if a resource that should be included is not found.", () => {
    const deserializer = new JsonApiDeserializer(article, [], "authors");
    expect(deserializer.deserialize).toThrowError();
  });

  it("Should assignate null if the related field is null", () => {
    const data = {
      type: "person",
      id: "person1",
      attributes: { age: 10 },
      relationships: {
        father: { data: null },
      },
    };
    const result = new JsonApiDeserializer(data, [], "").deserialize();
    expect(result.father).toBe(null);
  });
});
