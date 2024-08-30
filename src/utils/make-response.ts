interface HttpResponse<T> {
  payload: T;
}

interface HttpResponseList<T> {
  payload: Array<T>;
}

export function makeResponse<T>(res: T): HttpResponse<T> {
  return {
    payload: res,
  };
}

export function makeResponseList<T>(res: Array<T>): HttpResponseList<T> {
  return {
    payload: res,
  };
}
