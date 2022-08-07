import * as rx from "rxjs";
import * as ro from "rxjs/operators";

import { MessageModel } from "../../generated/shared";
import { Logger } from "../../util/Logger";
import { SERVER } from "./Server";
import { retryPromise } from "../../util/retryPromise";
import { ChatLoopAction } from "./ChatLoopAction";

export const MAX_VISIBLE_MESSAGES_LENGTH = 100

export class ChatLoop {

    private readonly logger = new Logger(ChatLoop.name);

    private messagesToDisplay: MessageModel[] = [];
    private lastReceivedMessage : MessageModel | null = null

    private subscription?: rx.Subscription;
    private isPagedToTop = false;
    private isPagedToBottom = false;

    private readonly actionSubject = new rx.Subject<ChatLoopAction>();
    private readonly actionFinishedSubject = new rx.Subject<void>();

    constructor(private readonly renderMessages: React.Dispatch<React.SetStateAction<MessageModel[]>>,
        private readonly actionFinishedAction: React.MutableRefObject<'movetoBottom' | undefined>,
        private readonly messagesListDiv: React.RefObject<HTMLDivElement>,
        private readonly messagesListViewPortDiv: React.RefObject<HTMLDivElement>
    ) {
    }

    public readonly dispatch = (action: ChatLoopAction) => this.actionSubject.next(action);

    public readonly start = () => {

        this.subscription = this.actionSubject
            .pipe(
                ro.concatMap(this.handleAction)
            )
            .subscribe({
                error: error => this.logger.error("Error in loop", {}, error)
            });

        return () => {
            this.subscription?.unsubscribe();
        };
    };

    public readonly handleActionCompleted = () => {

        if (this.actionFinishedAction.current === 'movetoBottom') {
            this.actionFinishedAction.current = undefined
            this.messagesListDiv.current!.scrollTop = this.messagesListDiv.current!.scrollHeight - this.messagesListDiv.current!.clientHeight
        }

        this.actionFinishedSubject.next ()
    }

    private readonly setMessages = (setter : (state : MessageModel []) => MessageModel []) => this.renderMessages (state => {

        this.messagesToDisplay = setter (state)

        return this.messagesToDisplay;
    })

    private readonly observeActionFinished = () => this.actionFinishedSubject
        .pipe(
            ro.first()
        );

    private readonly handleAction = (action: ChatLoopAction) => {

        if (action.type === 'handleMessageList') {
            return this.handleMessageListAction(action.payload);
        }
        else if (action.type === 'handleMessage') {
            return this.handleMessageAction(action.payload);
        }
        else if (action.type === 'handleScroll') {
            return this.handleScrollAction();
        }
        else if (action.type === 'handleWheel') {
            return this.handleWheelAction(action.payload);
        }

        return rx.EMPTY;

    };

    private readonly handleMessageListAction = (list: MessageModel[]) => {

        if (list.length === 0) {
            this.lastReceivedMessage = null
        }
        else {
            this.lastReceivedMessage = list[list.length - 1]
        }

        this.actionFinishedAction.current = 'movetoBottom';

        this.setMessages(() => list);
            
        return this.observeActionFinished();
    };

    private isScrolledToBottom = () => this.messagesListDiv.current!.scrollHeight - this.messagesListDiv.current!.scrollTop === this.messagesListDiv.current!.clientHeight

    private readonly handleMessageAction = (message: MessageModel) => {

        const oldLastReceivedMessage : MessageModel | null = this.lastReceivedMessage

        if (this.lastReceivedMessage) {
            if (this.lastReceivedMessage.index <= message.index) {
                this.lastReceivedMessage = message
            }
        }
        else {
            this.lastReceivedMessage = message
        }

        if (this.isScrolledToBottom ()) {

            const canSetMessage = () => {
                if (this.messagesToDisplay.length === 0) {
                    return true
                }
                else if (oldLastReceivedMessage) {
                    if (this.messagesToDisplay[this.messagesToDisplay.length - 1].id === oldLastReceivedMessage.id) {
                
                        return true
                    }
                }
    
                return false
            }

            if (canSetMessage ()) {
                this.setMessages(list => {
                    const index = list.findIndex(item => item.id === message.id);
        
                    if (index >= 0) {
                        list[index] = message;
                        return list;
                    }
                    else {
                        this.actionFinishedAction.current = 'movetoBottom';
        
                        const result = [...list, message];
        
                        if (result.length > MAX_VISIBLE_MESSAGES_LENGTH) {
                            return result.slice((result.length - MAX_VISIBLE_MESSAGES_LENGTH));
                        }
                        else {
                            return result;
                        }
                    }
                });
                
                return this.observeActionFinished();
            }

            return rx.EMPTY
        }

        return rx.EMPTY


    };


    private readonly handleScrollAction = () => {

        if (this.messagesListDiv.current!.scrollTop !== 0) {
            this.isPagedToTop = false;
        }

        if (!this.isScrolledToBottom ()) {
            this.isPagedToBottom = false;
        }

        if (this.messagesListDiv.current!.scrollHeight - this.messagesListDiv.current!.scrollTop - this.messagesListDiv.current!.clientHeight === 0) {
            if (this.messagesToDisplay.length > MAX_VISIBLE_MESSAGES_LENGTH) {

                this.actionFinishedAction.current = 'movetoBottom';
                this.setMessages(stateMessages => stateMessages.slice(stateMessages.length - MAX_VISIBLE_MESSAGES_LENGTH));

                return this.observeActionFinished();
            }
        }

        return rx.EMPTY;
    };


    private readonly handleWheelAction = (event: React.WheelEvent) => {

        if (this.messagesToDisplay.length === 0) {
            return rx.EMPTY;
        }

        if (this.messagesListDiv.current?.scrollTop === 0) {
            return this.handlePageUp (event)
        }
        else if (this.isScrolledToBottom ()) {
            return this.handlePageDown (event)
        }

        return rx.EMPTY

    };

    private readonly handlePageUp = (event: React.WheelEvent) => {

        if (event.deltaY >= 0) {
            return rx.EMPTY;
        }

        if (this.isPagedToTop) {
            return rx.EMPTY;
        }

        retryPromise(this.logger, () => SERVER.listMessagesBefore(this.messagesToDisplay[0].index))
            .then(response => {
                if (response.type === 'success') {

                    if (response.messages.length === 0) {
                        this.isPagedToTop = true;
                        this.actionFinishedSubject.next();
                        return;
                    }

                    const needToScrollToBottom = this.messagesListDiv.current!.clientHeight - this.messagesListViewPortDiv.current!.clientHeight >= 0;

                    if (needToScrollToBottom) {
                        this.actionFinishedAction.current = 'movetoBottom';
                    }
                    else {
                        this.actionFinishedAction.current = undefined;
                    }

                    
                    this.setMessages(stateMessages => {
                        const result = [...response.messages, ...stateMessages]

                        if (result.length > MAX_VISIBLE_MESSAGES_LENGTH) {
                            return result.slice (0, MAX_VISIBLE_MESSAGES_LENGTH)
                        }
                        else {
                            return result
                        }
                    });

                    if (!needToScrollToBottom) {
                        this.messagesListDiv.current!.scrollTop = 1;
                    }
                }
            });

        return this.observeActionFinished();
    }
    
    private readonly handlePageDown = (event: React.WheelEvent) => {
        if (event.deltaY <= 0) {
            return rx.EMPTY;
        }

        if (this.lastReceivedMessage === null) {
            return rx.EMPTY;
        }
        
        if (this.messagesToDisplay[this.messagesToDisplay.length - 1].id === this.lastReceivedMessage.id) {
            return rx.EMPTY;
        }
        
        if (this.isPagedToBottom) {
            return rx.EMPTY;
        }

        retryPromise(this.logger, () => SERVER.listMessagesAfter(this.messagesToDisplay[this.messagesToDisplay.length - 1].index))
            .then(response => {
                if (response.type === 'success') {

                    if (response.messages.length === 0) {
                        this.isPagedToBottom = true;
                        this.actionFinishedSubject.next();
                        return;
                    }


                    this.setMessages(stateMessages => {
                        const result = [...stateMessages, ...response.messages]

                        if (result.length > MAX_VISIBLE_MESSAGES_LENGTH) {
                            return result.slice (result.length - MAX_VISIBLE_MESSAGES_LENGTH)
                        }
                        else {
                            return result
                        }
                    });
                }
            });

        return this.observeActionFinished();
    }

}
