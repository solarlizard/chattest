import * as rx from "rxjs";
import * as ro from "rxjs/operators";

import { MessageModel } from "../../generated/shared";
import { Logger } from "../../util/Logger";
import { SERVER } from "./Server";
import { retryPromise } from "../../util/retryPromise";
import { ChatLoopAction } from "./ChatLoopAction";
import { MAX_VISIBLE_MESSAGES_LENGTH } from "./Chat";


export class ChatLoop {

    private readonly logger = new Logger(ChatLoop.name);

    private messages: MessageModel[] = [];

    private subscription?: rx.Subscription;
    private pagedToTop = false;

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

        this.messages = setter (state)

        return this.messages;
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
        this.actionFinishedAction.current = 'movetoBottom';
        this.setMessages(() => list);

        return this.observeActionFinished();
    };

    private readonly handleMessageAction = (message: MessageModel) => {

        this.setMessages(list => {
            const index = list.findIndex(item => item.id === message.id);

            if (index >= 0) {
                list[index] = message;
                return list;
            }
            else if (this.messagesListDiv.current!.scrollHeight - this.messagesListDiv.current!.scrollTop === this.messagesListDiv.current!.clientHeight) {
                this.actionFinishedAction.current = 'movetoBottom';

                const result = [...list, message];

                if (result.length > 50) {
                    return result.slice((result.length - MAX_VISIBLE_MESSAGES_LENGTH));
                }
                else {
                    return result;
                }
            }
            else {
                return [...list, message];
            }
        });

        return this.observeActionFinished();
    };


    private readonly handleScrollAction = () => {


        if (this.messagesListDiv.current!.scrollTop !== 0) {
            this.pagedToTop = false;
        }

        if (this.messagesListDiv.current!.scrollHeight - this.messagesListDiv.current!.scrollTop - this.messagesListDiv.current!.clientHeight === 0) {
            if (this.messages.length > MAX_VISIBLE_MESSAGES_LENGTH) {

                this.actionFinishedAction.current = 'movetoBottom';
                this.setMessages(stateMessages => stateMessages.slice(stateMessages.length - MAX_VISIBLE_MESSAGES_LENGTH));

                return this.observeActionFinished();
            }
        }

        return rx.EMPTY;
    };


    private readonly handleWheelAction = (event: React.WheelEvent) => {

        if (this.messages.length === 0) {
            return rx.EMPTY;
        }

        if (this.messagesListDiv.current?.scrollTop !== 0) {
            return rx.EMPTY;
        }

        if (event.deltaY >= 0) {
            return rx.EMPTY;
        }

        if (this.pagedToTop) {
            return rx.EMPTY;
        }

        retryPromise(this.logger, () => SERVER.listMessagesBefore(this.messages[0].index))
            .then(response => {
                if (response.type === 'success') {

                    if (response.messages.length === 0) {
                        this.pagedToTop = true;
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

                    this.setMessages(stateMessages => [...response.messages, ...stateMessages]);

                    if (!needToScrollToBottom) {
                        this.messagesListDiv.current!.scrollTop = 1;
                    }
                }
            });

        return this.observeActionFinished();
    };

}
