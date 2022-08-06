import React, {useRef, useState } from "react";
import { ListMessagesResponse } from "../../../generated/ListMessagesResponse";
import { MessageModel } from "../../../generated/shared";
import { Logger } from "../../../util/Logger";
import { retryPromise } from "../../../util/retryPromise";
import { SERVER } from "../Server";

import styles from "./Board.module.css"

import {Message} from "./message/Message"

export interface BoardProps {
    streamedMessages : MessageModel []
}

const logger = new Logger ("Board")

export const Board = (props : BoardProps) => {

    const firstMessageOnScreen = useRef (false)
    const mouseIsOver = React.useRef(false)
    const firstMessaageWasReceieved = useRef (false)
    
    const [loadedMessages, setLoadedMessages] = useState<MessageModel []> ([])

    const bottomRef = React.useRef<HTMLDivElement>(null);
    const thisRef = useRef<HTMLDivElement> (null)
    const preventHandleWheel = useRef (false)


    const handleMouseOver = () => mouseIsOver.current = true
    
    const handleMouseLeave = () => {
        mouseIsOver.current = false
        bottomRef.current?.scrollIntoView({});
    }

    const handleScroll = (e : React.UIEvent<HTMLDivElement>) => {

        if (props.streamedMessages.length === 0) {
            return
        }
        
        const checkScrolledToBottom = () => thisRef.current!.scrollHeight - thisRef.current!.scrollTop - thisRef.current!.clientHeight === 0

        if (checkScrolledToBottom ()) {
            setLoadedMessages ([])
            firstMessageOnScreen.current = false
        }
    }


    const handleWheel = (e : React.WheelEvent<HTMLDivElement>) => {

        if (preventHandleWheel.current || firstMessageOnScreen.current) {
            return
        }

        if (thisRef.current?.scrollTop !== 0 || e.deltaY >= 0) {
            return
        }

        const afterIndex = calculateAfterIndex ()

        if (afterIndex === null) {
            return
        }
        
        doLoadPage (afterIndex)
    }

    const handlePageLoadResponse = (response : ListMessagesResponse) => {
        if (response.type === 'success') {
            if (response.messages.length !== 0) {
                setLoadedMessages (list => [...response.messages,...list])
            }
            else {
                firstMessageOnScreen.current = true
            }

            thisRef.current!.scrollTop = 1
        }
        else {
            logger.error ("Invalid pading response", {response})
        }
    }
    

    React.useEffect(() => {
        
        if (!mouseIsOver.current || firstMessaageWasReceieved.current === false) {
            bottomRef.current?.scrollIntoView({});
        }   

        if (props.streamedMessages.length > 0) {
            firstMessaageWasReceieved.current = true
        }

    }, [props.streamedMessages]);

    const doLoadPage = (afterIndex : number) => {

        preventHandleWheel.current = true

        retryPromise (logger, () => SERVER.listMessagesBefore (afterIndex))
            .then (handlePageLoadResponse)
            .finally (() => {
                preventHandleWheel.current = false
            })
    }


    const calculateAfterIndex = () => {
        if (loadedMessages.length > 0) {
            return loadedMessages[0].index
        }
        else if (props.streamedMessages.length > 0) {
            return props.streamedMessages[0].index
        }
        else {
            return null
        }
    }    

    return (
        <div ref={thisRef} className={styles.Board} onMouseEnter={handleMouseOver} onMouseLeave={handleMouseLeave} onScroll={handleScroll} onWheel={handleWheel}>
            {loadedMessages.map (item => <Message key={item.id} message={item}/>)}
            {props.streamedMessages.map (item => <Message key={item.id} message={item}/>)}
            <div ref={bottomRef} />
        </div>
      )
};
