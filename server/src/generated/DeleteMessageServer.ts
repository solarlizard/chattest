import {Request} from "express"
import { DeleteMessageRequest } from "./DeleteMessageRequest"
import { DeleteMessageResponse } from "./DeleteMessageResponse"

export type DeleteMessageExpressRequest = Request<DeleteMessageRequest.Params, unknown, unknown>

export interface DeleteMessageServer {
    deleteMessage : (request : DeleteMessageExpressRequest) => Promise<DeleteMessageResponse>
}