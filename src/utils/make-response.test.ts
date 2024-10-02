import { makeResponse, makeResponseList } from "../utils/make-response"; 

describe("makeResponse", () => {
  it("dovrebbe restituire un oggetto HttpResponse con un payload singolo", () => {
    const input = { id: 1, name: "Test" };
    const result = makeResponse(input);

    expect(result).toEqual({
      payload: input,
    });
  });

  it("dovrebbe gestire tipi primitivi come payload", () => {
    const input = 42;
    const result = makeResponse(input);

    expect(result).toEqual({
      payload: input,
    });
  });
});

describe("makeResponseList", () => {
  it("dovrebbe restituire un oggetto HttpResponseList con un array di payload", () => {
    const input = [
      { id: 1, name: "Test1" },
      { id: 2, name: "Test2" },
    ];
    const result = makeResponseList(input);

    expect(result).toEqual({
      payload: input,
    });
  });

  it("dovrebbe gestire array di tipi primitivi come payload", () => {
    const input = [1, 2, 3, 4, 5];
    const result = makeResponseList(input);

    expect(result).toEqual({
      payload: input,
    });
  });

  it("dovrebbe restituire un array vuoto se l'input è un array vuoto", () => {
    const input: Array<unknown> = [];
    const result = makeResponseList(input);

    expect(result).toEqual({
      payload: input,
    });
  });
});
