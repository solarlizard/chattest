import { InvalidRequestResponse } from "./InvalidRequestResponse"
import { MessageModel } from "./shared"
import { SuccessResponse } from "./SuccessResponse"

export type DeleteMessageResponse = InvalidRequestResponse | DeleteMessageResponse.Success | DeleteMessageResponse.MessageNotFound

export namespace DeleteMessageResponse {
    
    export interface Success extends SuccessResponse {
        message : MessageModel
    }
    
    export interface MessageNotFound {
        type : 'messageNotFound'
    }
}