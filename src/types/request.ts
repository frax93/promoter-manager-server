import { Request } from "express";

export interface PromoterManagerRequest<TParams = {}, TBody = {}, TQuery = {}>
  extends Request<TParams, unknown, TBody, TQuery> {
  body: TBody;
  params: TParams;
  query: TQuery;
}

export type PromoterManagerRequestBody<
  RequestBody = unknown
> = PromoterManagerRequest<unknown, RequestBody>;

