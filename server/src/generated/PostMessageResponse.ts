import { InvalidRequestResponse } from "./InvalidRequestResponse"
import { ResponseException } from "./ResponseException"
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
    
    export interface EmptyContent  {
        type : 'emptyContent'
    }

    export class EmptyContentException extends ResponseException<EmptyContent> {
        constructor () {
            super ({
                type : 'emptyContent'
            })
        }
    }
}