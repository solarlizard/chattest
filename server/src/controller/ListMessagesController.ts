import { ListMessagesResponse } from "../generated/ListMessagesResponse";
import { ListMessagesExpressRequest, ListMessagesServer } from "../generated/ListMessagesServer";
import { MESSAGE_SERVICE } from "../service/MessageService";
import { ListMessagesQueryServiceModel } from "../service/model/ListMessagesQueryServiceModel";
import { createMessageModel } from "./createMessageModel";

export class ListMessagesController implements ListMessagesServer {
    
    readonly listMessaages = async (request: ListMessagesExpressRequest) : Promise<ListMessagesResponse> => ({
        type : 'success',
        messages : await MESSAGE_SERVICE.listPage (this.createQueryServiceModel (request))
            .then (list => list.map (createMessageModel)
        )
    })

    private readonly createQueryServiceModel = (request : ListMessagesExpressRequest) : ListMessagesQueryServiceModel => {
        if (request.query.type === 'before') {
            return {
                beforeIndex : parseInt (request.query.index)
            }
        }
        else /* istanbul ignore else */ if (request.query.type === 'after') {
            return {
                afterIndex : parseInt (request.query.index)
            }
        }
        else {
            throw Error ("Invalid request")
        }
    }
}