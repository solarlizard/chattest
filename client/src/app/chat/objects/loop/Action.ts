import { MessageModel } from "../../../../generated/shared";

export type Action = {
    type: 'handleMessage';
    payload: MessageModel;
} | {
    type: 'handleMessageList';
    payload: MessageModel[];
} | {
    type: 'handleWheel';
    payload: React.WheelEvent<HTMLDivElement>;
} | {
    type: 'handleScroll';
    payload: React.UIEvent<HTMLDivElement>;
};
