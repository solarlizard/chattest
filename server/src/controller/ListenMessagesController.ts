import * as rx from "rxjs"
import * as ro from "rxjs/operators"
import { ListenMessagesResponse } from "../generated/ListenMessagesResponse";
import { ListenMessagesServer } from "../generated/ListenMessagesServer";
import { MESSAGE_BUS } from "../logic/MessageBus";
import { MESSAGE_SERVICE } from "../service/MessageService";
import { MessageServiceModel } from "../service/model/MessageServiceModel";
import { createMessageModel } from "./createMessageModel";

export class ListenMessagesController implements ListenMessagesServer {
    
    readonly listenMessages = () : rx.Observable<ListenMessagesResponse> => rx.merge (
        this.listPage (),
        this.observeMessageBus ()
    )

    private readonly listPage = () => rx.from (
            MESSAGE_SERVICE.listPage ({})
        .then (this.createPageSuccessResponseModel)
    )

    private readonly observeMessageBus = () => MESSAGE_BUS.observe ()
        .pipe (
            ro.map (this.createSingleMessageSuccessResponseModel)
        )

    private readonly createSingleMessageSuccessResponseModel = (message : MessageServiceModel) : ListenMessagesResponse => ({
        type : 'success',
        result : {
            type : 'update',
            message : createMessageModel (message)
        }
    })

    private readonly createPageSuccessResponseModel = (messages : MessageServiceModel []) : ListenMessagesResponse => ({
        type : 'success',
        result : {
            type : 'list',
            messages : messages
                .map (createMessageModel)
        }
    })
}