import * as rx from "rxjs"
import { MessageServiceModel } from "../service/model/MessageServiceModel"

export class MessageBus {
    
    private readonly messageSubject = new rx.Subject<MessageServiceModel> ()

    public readonly observe = () : rx.Observable<MessageServiceModel> => this.messageSubject

    public readonly notify = (message : MessageServiceModel) => this.messageSubject.next (message)
}

export const MESSAGE_BUS = new MessageBus ()