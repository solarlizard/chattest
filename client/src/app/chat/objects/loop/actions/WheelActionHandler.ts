import { EMPTY } from "rxjs";
import { Logger } from "../../../../../util/Logger";
import { Loop } from "../Loop";
import { PageDownWheelActionHandler } from "./wheel/PageDownWheelActionHandler";
import { PageUpWheelActionHandler } from "./wheel/PageUpWheelActionHandler";

export class WheelActionHandler {

    public readonly logger = new Logger(WheelActionHandler.name);

    private readonly pageUpHandler = new PageUpWheelActionHandler (this.loop)
    private readonly pageDownHandler = new PageDownWheelActionHandler (this.loop)

    constructor(private readonly loop : Loop) {
    }

    public readonly handleWheelAction = (event: React.WheelEvent) => {

        const messagesToDisplay = this.loop.getMessagesToDisplay()

        if (messagesToDisplay.length === 0) {
            return EMPTY;
        }

        if (this.loop.messagesListDiv.current?.scrollTop === 0) {
            return this.pageUpHandler.handlePageUp (event, messagesToDisplay)
        }
        else if (this.loop.isScrolledToBottom ()) {
            return this.pageDownHandler.handlePageDown (event, messagesToDisplay)
        }

        return EMPTY;

    };

}