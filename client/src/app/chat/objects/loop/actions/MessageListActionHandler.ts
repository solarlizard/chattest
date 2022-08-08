import { MessageModel } from "../../../../../generated/shared";
import { Logger } from "../../../../../util/Logger";
import { Loop } from "../Loop";

export class MessageListActionHandler {

    public readonly logger = new Logger(MessageListActionHandler.name);

    constructor(private readonly loop : Loop) {
    }

    public readonly handleMessageListAction = (list: MessageModel[]) => {

        this.setLastReceivedMessage (list)

        this.loop.setPostRenderAction ('scrollToBottom')

        this.loop.renderMessages(() => list);
            
        return this.loop.observeActionFinished();
    };


    private readonly setLastReceivedMessage = (list : MessageModel []) => {

        if (list.length === 0) {
            this.loop.setLastReceivedMessage (null)
        }
        else {
            this.loop.setLastReceivedMessage (list[list.length - 1])
        }
    }

}
