import { EMPTY } from "rxjs";
import { ListMessagesResponse } from "../../../../../../generated/ListMessagesResponse";
import { MessageModel } from "../../../../../../generated/shared";
import { Logger } from "../../../../../../util/Logger";
import { SERVER } from "../../../../Server";
import { Loop, MAX_VISIBLE_MESSAGES_LENGTH } from "../../Loop";

export class PageDownWheelActionHandler {

    public readonly logger = new Logger(PageDownWheelActionHandler.name);

    constructor(private readonly loop : Loop) {
    }

    public readonly handlePageDown = (event: React.WheelEvent, messagesToDisplay : MessageModel []) => {
        if (this.isScrollingDown (event)) {
            return EMPTY;
        }

        const lastReceivedMessage = this.loop.getLastReceivedMessage ()

        if (lastReceivedMessage === null) {
            return EMPTY;
        }
        
        if (this.isScrolledToLastReceivedMessage (lastReceivedMessage, messagesToDisplay)) {
            return EMPTY;
        }
        
        if (this.loop.getPagedTo () === 'bottom') {
            return EMPTY;
        }

        this.requestPage (messagesToDisplay[messagesToDisplay.length - 1].index)
            
        return this.loop.observeActionFinished();
    }

    private readonly isScrolledToLastReceivedMessage = (lastReceivedMessage : MessageModel, messagesToDisplay : MessageModel []) => messagesToDisplay[messagesToDisplay.length - 1].id === lastReceivedMessage.id

    private readonly isScrollingDown = (event: React.WheelEvent) => event.deltaY <= 0

    private readonly requestPage = (afterIndex : number) => SERVER.listMessagesAfter (afterIndex)
        .then(this.handleResponse)
        .catch (error => {
            this.logger.error ("Error requesting mesasges", {}, error)
            this.loop.notifyActionFinished (1000)
        })

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