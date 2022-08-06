import {Request} from "express"
import { ListMessagesRequest } from "./ListMessagesRequest"
import { ListMessagesResponse } from "./ListMessagesResponse"

export type ListMessagesExpressRequest = Request<unknown, unknown, unknown, ListMessagesRequest.Query>

export interface ListMessagesServer {
    listMessaages : (request : ListMessagesExpressRequest) => Promise<ListMessagesResponse>
}