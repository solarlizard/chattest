import * as rx from "rxjs";

import { MessageModel } from "../../../../../generated/shared";
import { Logger } from "../../../../../util/Logger";
import { Loop, MAX_VISIBLE_MESSAGES_LENGTH } from "../Loop";


export class NewMessageActionHandler {

    private readonly logger = new Logger(NewMessageActionHandler.name);

    constructor(private readonly loop : Loop) {
    }

    public readonly handleMessageAction = (message: MessageModel) => {
        const oldLastReceivedMessage = this.setLastReceivedMessageIfItIsLast (message)

        if (!this.loop.isScrolledToBottom ()) {            
            return rx.EMPTY
        }
        

        if (!this.needToRender (oldLastReceivedMessage)) {
            return rx.EMPTY
        }

        this.loop.renderMessages(this.updateList (message));
        
        return this.loop.observeActionFinished();
    };

    private readonly updateList = (message : MessageModel) => (list : MessageModel []) => {
        const index = list.findIndex(item => item.id === message.id);

        if (index >= 0) {
            list[index] = message;
            return list;
        }
        else {
            return this.doUpdateList (message, list)
        }
    }

    private readonly doUpdateList = (message : MessageModel, list : MessageModel []) => {
        this.loop.setPostRenderAction ('scrollToBottom');

        const result = [...list, message];

        return this.shrinkMessageListIfNeeded (result)
    }

    private readonly shrinkMessageListIfNeeded = (list : MessageModel []) => {

        if (list.length > MAX_VISIBLE_MESSAGES_LENGTH) {
            return list.slice((list.length - MAX_VISIBLE_MESSAGES_LENGTH));
        }
        else {
            return list;
        }
    }

    private readonly needToRender = (oldLastReceivedMessage : MessageModel | null) => {
        
        const messagesToDisplay = this.loop.getMessagesToDisplay ();

        if (messagesToDisplay.length === 0) {
            return true
        }
        else if (oldLastReceivedMessage) {
    
            if (messagesToDisplay[messagesToDisplay.length - 1].id === oldLastReceivedMessage.id) {        
                return true
            }
        }

        return false
    }

    private readonly setLastReceivedMessageIfItIsLast = (message : MessageModel) => {

        const lastReceivedMessage = this.loop.getLastReceivedMessage ()

        if (lastReceivedMessage) {
            if (lastReceivedMessage.index <= message.index) {
                this.loop.setLastReceivedMessage (message)
            }
        }
        else {
            this.loop.setLastReceivedMessage (message)
        }

        return lastReceivedMessage
    }

}
