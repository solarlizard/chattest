import * as rx from "rxjs";
import * as ro from "rxjs/operators";

import { MessageModel } from "../../../../generated/shared";
import { Logger } from "../../../../util/Logger";
import { Action } from "./Action";
import { NewMessageActionHandler } from "./actions/NewMessageActionHandler";
import { MessageListActionHandler } from "./actions/MessageListActionHandler";
import { POST_RENDER_ACTION } from "./POST_RENDER_ACTION";
import { ScrollActionHandler } from "./actions/ScrollActionHandler";
import { WheelActionHandler } from "./actions/WheelActionHandler";

export const MAX_VISIBLE_MESSAGES_LENGTH = 100

export class Loop {

    private readonly logger = new Logger(Loop.name);

    private messagesToDisplay: MessageModel[] = [];
    private lastReceivedMessage : MessageModel | null = null

    private subscription?: rx.Subscription;
    private pagedTo : 'top' | 'bottom' | 'middle' = 'middle'

    private readonly actionSubject = new rx.Subject<Action>();
    private readonly actionFinishedSubject = new rx.Subject<void>();

    private readonly messageActionHandler = new NewMessageActionHandler (this)
    private readonly messageListActionHandler = new MessageListActionHandler (this)
    private readonly scrollActionHandler = new ScrollActionHandler (this)
    private readonly wheelActionHandler = new WheelActionHandler (this)

    public readonly getLastReceivedMessage = () => this.lastReceivedMessage
    public readonly setLastReceivedMessage = (message : MessageModel | null) => this.lastReceivedMessage = message

    public readonly getPagedTo = () => this.pagedTo
    public readonly setPagedTo = (value : typeof this.pagedTo) => this.pagedTo = value
    
    public readonly setPostRenderAction = (action : POST_RENDER_ACTION) => this.postRenderAction.current = action
    public readonly getMessagesToDisplay = () => this.messagesToDisplay

    constructor(private readonly doRenderMessages: React.Dispatch<React.SetStateAction<MessageModel[]>>,
        private readonly postRenderAction: React.MutableRefObject<POST_RENDER_ACTION>,
        public readonly messagesListDiv: React.RefObject<HTMLDivElement>,
        public readonly messagesListViewPortDiv: React.RefObject<HTMLDivElement>
    ) {
    }

    public readonly notifyActionFinished = (delay? : number) => {
        if (delay) {
            setTimeout(() => {
                this.actionFinishedSubject.next () 
            }, delay);
        }
        else {
            this.actionFinishedSubject.next ()
        }
    }

    public readonly dispatch = (action: Action) => this.actionSubject.next(action);

    public readonly start = () => {

        this.subscription = this.actionSubject
            .pipe(
                ro.concatMap (this.handleAction)
            )
            .subscribe(this.logger.rx.subscribe ("Error in loop"));

        return () => {
            this.subscription?.unsubscribe();
        };
    };

    public readonly handlePostRenderAction = () => {

        try {
            if (this.postRenderAction.current === 'scrollToBottom') {
                this.scrollToBottom ()
            }
        }
        finally {
            this.postRenderAction.current = null
        }

        this.notifyActionFinished ()
    }

    public readonly isScrolledToBottom = () => this.messagesListDiv.current!.scrollHeight - this.messagesListDiv.current!.scrollTop === this.messagesListDiv.current!.clientHeight

    public readonly renderMessages = (setter : (state : MessageModel []) => MessageModel []) => this.doRenderMessages (state => {

        this.messagesToDisplay = setter (state)

        return this.messagesToDisplay;
    })

    public readonly observeActionFinished = () => this.actionFinishedSubject
        .pipe(
            ro.first()
        );

    private readonly handleAction = (action: Action) => {

        if (action.type === 'handleMessageList') {
            return this.messageListActionHandler.handleMessageListAction(action.payload);
        }
        else if (action.type === 'handleMessage') {
            return this.messageActionHandler.handleMessageAction (action.payload)
        }
        else if (action.type === 'handleScroll') {
            return this.scrollActionHandler.handleScrollAction();
        }
        else if (action.type === 'handleWheel') {
            return this.wheelActionHandler.handleWheelAction(action.payload);
        }

        return rx.EMPTY;

    };


    private readonly scrollToBottom = () => {
        this.messagesListDiv.current!.scrollTop = this.messagesListDiv.current!.scrollHeight - this.messagesListDiv.current!.clientHeight
    }
}
