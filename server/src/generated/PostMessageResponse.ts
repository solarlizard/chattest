import { InvalidRequestResponse } from "./InvalidRequestResponse"
import { MessageModel } from "./shared"
import { SuccessResponse } from "./SuccessResponse"

export type PostMessageResponse = InvalidRequestResponse | PostMessageResponse.Success

export namespace PostMessageResponse {
    
    export interface Success extends SuccessResponse {
        message : MessageModel
    }
}