import { EMPTY } from "rxjs";
import { ListMessagesResponse } from "../../../../../../generated/ListMessagesResponse";
import { MessageModel } from "../../../../../../generated/shared";
import { Logger } from "../../../../../../util/Logger";
import { retryPromise } from "../../../../../../util/retryPromise";
import { SERVER } from "../../../../Server";
import { Loop, MAX_VISIBLE_MESSAGES_LENGTH } from "../../Loop";

export class PageDownWheelActionHandler {

    public readonly logger = new Logger(PageDownWheelActionHandler.name);

    constructor(private readonly loop : Loop) {
    }

    public readonly handlePageDown = (event: React.WheelEvent, messagesToDisplay : MessageModel []) => {
        if (event.deltaY <= 0) {
            return EMPTY;
        }

        const lastReceivedMessage = this.loop.getLastReceivedMessage ()

        if (lastReceivedMessage === null) {
            return EMPTY;
        }
        
        if (messagesToDisplay[messagesToDisplay.length - 1].id === lastReceivedMessage.id) {
            return EMPTY;
        }
        
        if (this.loop.getPagedTo () === 'bottom') {
            return EMPTY;
        }

        const afterIndex = messagesToDisplay[messagesToDisplay.length - 1].index;

        retryPromise(this.logger, () => SERVER.listMessagesAfter(afterIndex))
            .then(this.handleResponse);

        return this.loop.observeActionFinished();
    }

    private readonly handleResponse = (response : ListMessagesResponse) => {

        if (response.type === 'success') {
            this.handleSuccessResponse (response)
        }
        else {
            this.logger.error ("Invalid response", {response})
        }

    }

    private readonly handleSuccessResponse = (response : ListMessagesResponse.Success) => {


        if (response.messages.length === 0) {
            this.handleEmptyPage ()
            return;
        }

        this.handlePage (response.messages)
    }

    private readonly handleEmptyPage = () => {
        this.loop.setPagedTo ('bottom')
        this.loop.notifyActionFinished ()
    }

    private readonly handlePage = (list : MessageModel []) => this.loop.renderMessages(stateMessages => {
        const result = [...stateMessages, ...list]

        return this.shrinkMessageListIfNeeded (result)
    });    

    private readonly shrinkMessageListIfNeeded = (list : MessageModel []) => {

        if (list.length > MAX_VISIBLE_MESSAGES_LENGTH) {
            return list.slice (list.length - MAX_VISIBLE_MESSAGES_LENGTH)
        }
        else {
            return list
        }
    }
}