import { InvalidRequestResponse } from "./InvalidRequestResponse"
import { MessageModel } from "./shared"
import { SuccessResponse } from "./SuccessResponse"

export type ListMessagesResponse = InvalidRequestResponse | ListMessagesResponse.Success

export namespace ListMessagesResponse {
    
    export interface Success extends SuccessResponse {
        messages : MessageModel []
    }
}