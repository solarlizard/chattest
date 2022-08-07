import * as rx from "rxjs"
import * as ro from "rxjs/operators"

import React, { useState, useEffect, useRef } from "react";

import styles from "./Chat.module.css"

import {Input} from "./input/Input"
import { MessageModel } from "../../generated/shared";
import { ListenMessagesResponse } from "../../generated/ListenMessagesResponse";
import { Logger } from "../../util/Logger";
import { SERVER } from "./Server";
import { Message } from "./message/Message";
import { retryPromise } from "../../util/retryPromise";

type Action = {
    type : 'handleMessage',
    payload : MessageModel
} | {
    type : 'handleMessageList',
    payload : MessageModel []
} | {
    type : 'handleWheel',
    payload : React.WheelEvent<HTMLDivElement>
} | {
    type : 'handleScroll',
    payload : React.UIEvent<HTMLDivElement>
}

const MAX_VISIBLE_MESSAGES_LENGTH = 50

export const Chat = () => {

    const [stateMessages, setStateMessages] = useState<MessageModel []> ([])

    const messages = React.useRef<MessageModel []> ([])

    const logger = React.useRef (new Logger ("Chat"))

    const loopSubject = React.useRef(new rx.Subject<Action> ())
    const actionFinishedSubject = React.useRef(new rx.Subject<void> ())
    
    const messagesListDiv = useRef<HTMLDivElement> (null)
    const messagesListViewPortDiv = useRef<HTMLDivElement> (null)
    const afterMessagesChangedAction = useRef<'movetoBottom'> ()
    const pagedToTop = useRef(false)

    const handleWheel = (event : React.WheelEvent<HTMLDivElement>) => loopSubject.current.next ({
        type : 'handleWheel',
        payload : event
    })

    const handleScroll = (event : React.WheelEvent<HTMLDivElement>) => loopSubject.current.next ({
        type : 'handleScroll',
        payload : event
    })

    const hanldeMouseLeave = () => {
        messagesListDiv.current!.scrollTop = messagesListDiv.current!.scrollHeight - messagesListDiv.current!.clientHeight
    }

    const handleSocketResponse = (response : ListenMessagesResponse) => {
        if (response.type === 'success') {
            
            if (response.result.type === 'list') {
                loopSubject.current.next ({
                    type : 'handleMessageList',
                    payload : response.result.messages
                })
            }
            else {
                loopSubject.current.next ({
                    type : 'handleMessage',
                    payload : response.result.message
                })
            }
        }
        else {
            logger.current.error ("Invalid response", {response})
        }

    }

    const setMessages = (setter : (state : MessageModel []) => MessageModel []) => setStateMessages (state => {
        messages.current = setter (state)

        return messages.current;
    })

    const observeActionFinished = () => actionFinishedSubject.current
        .pipe (
            ro.first ()
        )

    const handleAction = (action : Action) => {

        if (action.type === 'handleMessageList') {
            return handleMessageListAction (action.payload)
        }
        else if (action.type === 'handleMessage') {                        
            return handleMessageAction (action.payload)
        }
        else if (action.type === 'handleScroll') {
            return handleScrollAction ()
        }
        else if (action.type === 'handleWheel') {
            return handleWheelAction (action.payload)
        }

        return rx.EMPTY

    }
    
    const handleMessageListAction = (list : MessageModel []) => {
                    
        afterMessagesChangedAction.current = 'movetoBottom'
        setMessages (() => list)

        return observeActionFinished ()
    }

    const handleMessageAction = (message : MessageModel) => {
                    
        setMessages (list => {
            const index = list.findIndex (item => item.id === message.id)
    
            if (index >= 0) {
                list[index] = message
                return list
            }
            else if (messagesListDiv.current!.scrollHeight - messagesListDiv.current!.scrollTop === messagesListDiv.current!.clientHeight) {
                afterMessagesChangedAction.current = 'movetoBottom'

                const result = [...list, message]

                if (result.length > 50) {
                    return result.slice ( (result.length - MAX_VISIBLE_MESSAGES_LENGTH))
                }
                else {
                    return result
                }
            }
            else {
                return [...list, message]
            }
        })

        return observeActionFinished ()        
    }

    const handleScrollAction = () => {


        if (messagesListDiv.current!.scrollTop !== 0) {
            pagedToTop.current = false
        }

        if (messagesListDiv.current!.scrollHeight - messagesListDiv.current!.scrollTop - messagesListDiv.current!.clientHeight === 0) {
            if (messages.current.length > MAX_VISIBLE_MESSAGES_LENGTH) {

                afterMessagesChangedAction.current = 'movetoBottom'
                setMessages (stateMessages => stateMessages.slice (stateMessages.length - MAX_VISIBLE_MESSAGES_LENGTH))
                
                return observeActionFinished ()
            }
        }

        return rx.EMPTY
    }

    const handleWheelAction = (event : React.WheelEvent) => {
        if (messages.current.length === 0) {
            return rx.EMPTY
        }
        if (messagesListDiv.current?.scrollTop !== 0) {
            return rx.EMPTY
        }

        if (event.deltaY >= 0) {
            return rx.EMPTY
        }

        if (pagedToTop.current) {
            return rx.EMPTY
        }

        retryPromise (logger.current, () => SERVER.listMessagesBefore (messages.current[0].index))
            .then (response => {
                if (response.type === 'success') {

                    if (response.messages.length === 0) {
                        pagedToTop.current = true
                        actionFinishedSubject.current.next ()
                        return
                    }
                    
                    const needToScrollToBottom = messagesListDiv.current!.clientHeight - messagesListViewPortDiv.current!.clientHeight >= 0;

                    if (needToScrollToBottom) {
                        afterMessagesChangedAction.current = 'movetoBottom'
                    }
                    else {
                        afterMessagesChangedAction.current = undefined
                    }

                    setMessages (stateMessages => [...response.messages, ...stateMessages])
                    
                    if (!needToScrollToBottom) {
                        messagesListDiv.current!.scrollTop = 1
                    }
                }
            })                       

            return observeActionFinished ()            
    }
        
    useEffect (() => {

        if (afterMessagesChangedAction.current === 'movetoBottom') {
            afterMessagesChangedAction.current = undefined
            messagesListDiv.current!.scrollTop = messagesListDiv.current!.scrollHeight - messagesListDiv.current!.clientHeight
        }

        actionFinishedSubject.current.next ()
        
    }, [stateMessages]) // eslint-disable-line react-hooks/exhaustive-deps

    
    useEffect (() => {

        const subscription = loopSubject.current
            .pipe (
                ro.concatMap (handleAction),
                ro.catchError (error => {
                    logger.current.error ("Error in loop", {}, error)
                    return rx.EMPTY
                })
            )
            .subscribe ({
                error : error => logger.current.error ("Error in loop", {}, error)
            })
        
        return () => {
            subscription.unsubscribe ()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect (() => {

        const socket = SERVER.listenMessages (handleSocketResponse)
        
        return () => {
            socket.close ()
        }
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
