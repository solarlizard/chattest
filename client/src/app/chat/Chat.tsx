
import React, { useState, useEffect, useRef } from "react";

import styles from "./Chat.module.css"

import {Input} from "./input/Input"
import { MessageModel } from "../../generated/shared";
import { Message } from "./message/Message";
import { ChatLoop } from "./ChatLoop";
import { ChatConnection } from "./ChatConnection";

export const MAX_VISIBLE_MESSAGES_LENGTH = 50

export const Chat = () => {

    const [stateMessages, setStateMessages] = useState<MessageModel []> ([])
    
    const messagesListDiv = useRef<HTMLDivElement> (null)
    const messagesListViewPortDiv = useRef<HTMLDivElement> (null)
    const afterMessagesChangedAction = useRef<'movetoBottom'> ()
    
    const loop = React.useRef (new ChatLoop (setStateMessages, afterMessagesChangedAction, messagesListDiv, messagesListViewPortDiv))
    const connection = React.useRef (new ChatConnection (action => loop.current.dispatch (action)))

    const handleWheel = (event : React.WheelEvent<HTMLDivElement>) => loop.current.dispatch ({
        type : 'handleWheel',
        payload : event
    })

    const handleScroll = (event : React.WheelEvent<HTMLDivElement>) => loop.current.dispatch ({
        type : 'handleScroll',
        payload : event
    })

    const hanldeMouseLeave = () => {
        messagesListDiv.current!.scrollTop = messagesListDiv.current!.scrollHeight - messagesListDiv.current!.clientHeight
    }

    useEffect (() => {
        loop.current.handleActionCompleted ()

    }, [stateMessages]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect (() => {
        return loop.current.start ()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect (() => {
        return connection.current.start ()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    
    return (
        <div className={styles.Chat} style={{overflow: "hidden"}}>
            <div style={{overflow : "scroll"}} ref={messagesListDiv} onWheelCapture={handleWheel} onScrollCapture={handleScroll} onMouseLeave={hanldeMouseLeave}>
                <div ref={messagesListViewPortDiv}>
                    {stateMessages.map (item => <Message key={item.id} message={item}/>)}
                </div>
            </div>
            <Input/>
        </div>
    )
};
