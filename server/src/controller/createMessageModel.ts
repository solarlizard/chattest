import { MessageModel } from "../generated/shared";
import { MessageServiceModel } from "../service/model/MessageServiceModel";

export const createMessageModel = (message : MessageServiceModel) : MessageModel => ({
    id : message.id,
    index : message.index,
    ver : message.version,
    state : createState (message)
})


const createState = (message : MessageServiceModel) : MessageModel.ActiveStateModel | MessageModel.DeletedStateModel => {
    if (message.state.type === 'active') {
        return {
            type : 'active',
            author : message.state.author,
            content : message.state.content,
            created : message.state.created.toUTCString (),
            updated : message.state.updated?.toUTCString ()
        }
    }
    else {
        return {
            type : 'deleted',
            deleted : message.state.deleted.toUTCString ()
        }
    }
}