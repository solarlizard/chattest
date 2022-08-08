import { EMPTY } from "rxjs";
import { ListMessagesResponse } from "../../../../../../generated/ListMessagesResponse";
import { MessageModel } from "../../../../../../generated/shared";
import { Logger } from "../../../../../../util/Logger";
import { retryPromise } from "../../../../../../util/retryPromise";
import { SERVER } from "../../../../Server";
import { Loop, MAX_VISIBLE_MESSAGES_LENGTH } from "../../Loop";

export class PageUpWheelActionHandler {

    public readonly logger = new Logger(PageUpWheelActionHandler.name);

    constructor(private readonly loop : Loop) {
    }

    public readonly handlePageUp = (event: React.WheelEvent, messagesToDisplay : MessageModel []) => {

        if (this.isScrollingToTop (event)) {
            return EMPTY;
        }

        if (this.isAlreadyAtTop ()) {
            return EMPTY;
        }

        this.requestPage (messagesToDisplay[0].index)
        

        return this.loop.observeActionFinished();
    }

    private readonly requestPage = (beforeIndex : number) => SERVER.listMessagesBefore (beforeIndex)
        .then(this.handleResponse)
        .catch (error => {
            this.logger.error ("Error requesting mesasges", {}, error)
            this.loop.notifyActionFinished (1000)
        })

    private isScrollingToTop = (event: React.WheelEvent) => event.deltaY >= 0

    private readonly isAlreadyAtTop = () => this.loop.getPagedTo () === 'top'
    
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

        const needToScrollToBottom = this.createPostRenederAction ()

        this.handlePage (response.messages)
        
        if (!needToScrollToBottom) {
            this.loop.messagesListDiv.current!.scrollTop = 1;
        }
    }

    private readonly handleEmptyPage = () => {
        this.loop.setPagedTo ('top')
        this.loop.notifyActionFinished ()
    }

    private readonly handlePage = (page : MessageModel []) => this.loop.renderMessages(stateMessages => {
        const result = [...page, ...stateMessages]

        return this.shrinkMessageListIfNeeded (result)
    });


    private readonly createPostRenederAction = () => {

        const needToScrollToBottom = this.loop.messagesListDiv.current!.clientHeight - this.loop.messagesListViewPortDiv.current!.clientHeight >= 0;

        if (needToScrollToBottom) {
            this.loop.setPostRenderAction ('scrollToBottom')
        }
        else {
            this.loop.setPostRenderAction (null)
        }

        return needToScrollToBottom;
    }


    private readonly shrinkMessageListIfNeeded = (list : MessageModel []) => {

        if (list.length > MAX_VISIBLE_MESSAGES_LENGTH) {
            return list.slice (0, MAX_VISIBLE_MESSAGES_LENGTH)
        }
        else {
            return list
        }
    }

}