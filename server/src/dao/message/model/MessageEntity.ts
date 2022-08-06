
export interface MessageEntity {
    id : string,
    version : number,
    index : number,
    author : string | null,
    content : string | null,
    created : Date,
    updated? : Date,
    deleted? : Date
}