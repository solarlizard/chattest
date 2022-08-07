import { DeleteMessageResponse } from "../../generated/DeleteMessageResponse";
import { ListenMessagesResponse } from "../../generated/ListenMessagesResponse";
import { ListMessagesResponse } from "../../generated/ListMessagesResponse";
import { PostMessageResponse } from "../../generated/PostMessageResponse";
import { Logger } from "../../util/Logger";
import {io} from 'socket.io-client';

export interface PostMessageApiModel {
    readonly id : string,
    readonly author : string,
    readonly content : string
}

export class Server {

    private readonly logger = new Logger (Server.name);


    public readonly listenMessages = (handler : (response : ListenMessagesResponse) => void) => io({
        path : '/api/messages/connect',
    })
        .on ('data', handler)

    public readonly deleteMessage = (model : PostMessageApiModel) => fetch (`/api/messages/${model.id}`, {
        method : 'delete',
        headers : {
            "content-type" : "application/json"
        }
    })
        .then (this.handleResponse<DeleteMessageResponse>)
        .catch (this.handleError)

    public readonly postMessage = (model : PostMessageApiModel) => fetch (`/api/messages/${model.id}`, {
        method : 'post',
        headers : {
            "content-type" : "application/json"
        },
        body : JSON.stringify ({
            author : model.author,
            content : model.content
        })
    })
        .then (this.handleResponse<PostMessageResponse>)
        .catch (this.handleError)

    public readonly listMessagesBefore = (beforeIndex : number) => fetch (`/api/messages/?index=${beforeIndex}&type=before`, {
        method : 'get',
        headers : {
            "content-type" : "application/json"
        }
    })
        .then (this.handleResponse<ListMessagesResponse>)
        .catch (this.handleError)

    public readonly listMessagesAfter = (beforeIndex : number) => fetch (`/api/messages/?index=${beforeIndex}&type=after`, {
        method : 'get',
        headers : {
            "content-type" : "application/json"
        }
    })
        .then (this.handleResponse<ListMessagesResponse>)
        .catch (this.handleError)
        
    private readonly handleResponse = <R> (response : Response) => {
        if (response.status !== 200) {
            this.logger.error ("Error executing http request", {
                status : response.status,
                headers : response.headers
            })

            throw new Error ("Response status is not 200")
        }
        else {
            return response.json ()
                .then (result => result as R)
        }
    }

    private readonly handleError = (error : any) => {

        this.logger.error ("Error executing http request", {}, error)

        throw error
    }
}

export const SERVER = new Server ()