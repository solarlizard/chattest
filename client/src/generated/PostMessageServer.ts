import {Request} from "express"

import { PostMessageRequest } from "./PostMessageRequest"
import { PostMessageResponse } from "./PostMessageResponse"

export type PostMessageExpressRequest = Request<PostMessageRequest.Params, unknown, PostMessageRequest.Body>

export interface PostMessageServer {
    postMessage : (request : PostMessageExpressRequest) => Promise<PostMessageResponse>
}