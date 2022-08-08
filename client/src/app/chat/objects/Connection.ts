import { Logger } from "../../../util/Logger";
import { SERVER } from "../Server";
import { ListenMessagesResponse } from "../../../generated/ListenMessagesResponse";
import { Action } from "./loop/Action";


export class ChatConnection {

    private readonly logger = new Logger(ChatConnection.name);

    public constructor (private readonly dispatch : (action : Action) => void) {

    }

    public readonly start = () => {

        const socket = SERVER.listenMessages (this.handleSocketResponse)
        
        return () => {
            socket.disconnect ()
        }
    }


    private readonly handleSocketResponse = (response : ListenMessagesResponse) => {
        
        if (response.type === 'success') {
            
            if (response.result.type === 'list') {

                this.dispatch ({
                    type : 'handleMessageList',
                    payload : response.result.messages
                })
            }
            else {
                this.dispatch ({
                    type : 'handleMessage',
                    payload : response.result.message
                })
            }
        }
        else {
            this.logger.error ("Invalid response", {response})
        }

    }    
}
