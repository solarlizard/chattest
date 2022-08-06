import { InvalidRequestResponse } from "./InvalidRequestResponse"
import { MessageModel } from "./shared"
import { SuccessResponse } from "./SuccessResponse"

export type ListenMessagesResponse = InvalidRequestResponse | ListenMessagesResponse.Success

export namespace ListenMessagesResponse {
    
    export interface Success extends SuccessResponse {
        result : Success.ListResponse | Success.UpdateResponse
    }

    export namespace Success {
        export interface ListResponse {
            readonly type : 'list',
            readonly messages : MessageModel []
        }
        
        export interface UpdateResponse {
            readonly type : 'update',
            readonly message : MessageModel
        }
    }
}