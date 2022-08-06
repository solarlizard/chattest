import { MESSAGE_SERVICE } from "../service/MessageService"
import { MessageServiceModel } from "../service/model/MessageServiceModel";
import { MESSAGE_BUS } from "./MessageBus";

export class DeleteMessageLogicOperation {
    
    public readonly delete = async (message : MessageServiceModel) => {
        
        const deletedMessage = await MESSAGE_SERVICE.delete (message)
        
        if (deletedMessage) {
            
            MESSAGE_BUS.notify (deletedMessage)

            return deletedMessage;
        }
        else {
            return MESSAGE_SERVICE.getById (message.id)
        }
    }
}
