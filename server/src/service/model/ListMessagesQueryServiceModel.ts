
export interface ListMessagesQueryServiceModel {
    readonly limit : number;
    readonly beforeIndex?: number;
    readonly afterIndex?: number;
}
