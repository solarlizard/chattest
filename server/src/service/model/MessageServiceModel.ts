export interface MessageServiceModel {
    id : string,
    version : number,
    index : number,
    readonly state : MessageServiceModel.ActiveStateModel | MessageServiceModel.DeletedStateModel
}

export namespace MessageServiceModel {

    export interface ActiveStateModel {
        type : 'active',
        readonly content : string
        readonly author : string,
        readonly created : Date,
        readonly updated? : Date,
    }
    
    export interface DeletedStateModel {
        type : 'deleted',
        readonly deleted : Date
    }
}

