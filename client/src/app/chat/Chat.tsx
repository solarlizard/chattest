
import React, { useState, useEffect, useRef } from "react";

import styles from "./Chat.module.css"

import { MessageModel } from "../../generated/shared";
import { Message } from "./blocks/message/Message";
import { POST_RENDER_ACTION } from "./objects/loop/POST_RENDER_ACTION";
import { ChatConnection } from "./objects/Connection";
import { Loop } from "./objects/loop/Loop";
import { Input } from "./blocks/input/Input";

export const Chat = () => {

    const [stateMessages, setStateMessages] = useState<MessageModel []> ([])
    
    const messagesListDiv = useRef<HTMLDivElement> (null)
    const messagesListViewPortDiv = useRef<HTMLDivElement> (null)
    const postRenderAction = useRef<POST_RENDER_ACTION> (null)
    
    const loop = React.useRef (new Loop (setStateMessages, postRenderAction, messagesListDiv, messagesListViewPortDiv))
    const connection = React.useRef (new ChatConnection (action => loop.current.dispatch (action)))
    
    const handleWheel = (event : React.WheelEvent<HTMLDivElement>) => loop.current.dispatch ({
        type : 'handleWheel',
        payload : event
    })

    const handleScroll = (event : React.WheelEvent<HTMLDivElement>) => loop.current.dispatch ({
        type : 'handleScroll',
        payload : event
    })


    useEffect (() => loop.current.handlePostRenderAction (), [stateMessages]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect (() => loop.current.start (), []) // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect (() => connection.current.start (), []) // eslint-disable-line react-hooks/exhaustive-deps
    
    return (
        <div className={styles.Chat} style={{overflow: "hidden"}}>
            <div style={{overflow : "scroll"}} ref={messagesListDiv} onWheelCapture={handleWheel} onScrollCapture={handleScroll}>
                <div ref={messagesListViewPortDiv}>
                    {stateMessages.map (item => <Message key={item.id} message={item}/>)}
                </div>
            </div>
            <Input/>
        </div>
    )
};