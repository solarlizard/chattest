import { InvalidRequestResponse } from "./InvalidRequestResponse"
import { MessageModel } from "./shared"
import { SuccessResponse } from "./SuccessResponse"

export type PostMessageResponse = InvalidRequestResponse | PostMessageResponse.Success | PostMessageResponse.EmptyContent

export namespace PostMessageResponse {
    
    export interface Success extends SuccessResponse {
        message : MessageModel
    }
    
    export interface EmptyContent  {
        type : 'emptyContent'
    }

}
