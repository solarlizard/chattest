import { CreateMessageLogicOperation } from "./CreateMessageLogicOperation"
import { DeleteMessageLogicOperation } from "./DeleteMessageLogicOperation"

export class MessageLogic {
    
    public readonly create = new CreateMessageLogicOperation ().create
    
    public readonly delete = new DeleteMessageLogicOperation ().delete
}

export const MESSAGE_LOGIC = new MessageLogic ()