import { EMPTY } from "rxjs";
import { Logger } from "../../../../../util/Logger";
import { Loop, MAX_VISIBLE_MESSAGES_LENGTH } from "../Loop";

export class ScrollActionHandler {

    public readonly logger = new Logger(ScrollActionHandler.name);

    constructor(private readonly loop : Loop) {
    }

    public readonly handleScrollAction = () => {

        if (this.loop.messagesListDiv.current!.scrollTop !== 0 && this.loop.getPagedTo () === 'top') {
            this.loop.setPagedTo ('middle')
        }

        if (!this.loop.isScrolledToBottom () && this.loop.getPagedTo () === 'bottom') {
            this.loop.setPagedTo ('middle')
        }

        if (this.loop.messagesListDiv.current!.scrollHeight - this.loop.messagesListDiv.current!.scrollTop - this.loop.messagesListDiv.current!.clientHeight === 0) {
            if (this.loop.getMessagesToDisplay ().length > MAX_VISIBLE_MESSAGES_LENGTH) {

                this.loop.setPostRenderAction ('scrollToBottom');
                this.loop.renderMessages(stateMessages => stateMessages.slice(stateMessages.length - MAX_VISIBLE_MESSAGES_LENGTH));

                return this.loop.observeActionFinished();
            }
        }

        return EMPTY;
    };}
