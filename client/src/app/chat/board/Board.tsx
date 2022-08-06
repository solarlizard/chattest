import React, {useRef, useState } from "react";
import { MessageModel } from "../../../generated/shared";
import { Logger } from "../../../util/Logger";
import { retryPromise } from "../../../util/retryPromise";
import { SERVER } from "../Server";

import styles from "./Board.module.css"

import {Message} from "./message/Message"

export interface BoardProps {
    messages : MessageModel []
}

const logger = new Logger ("Board")

export const Board = (props : BoardProps) => {

    const allPagesReceived = useRef (false)
    const boardRerf = useRef<HTMLDivElement> (null)
    const mouseIsOver = React.useRef(false)

    const bottomRef = React.useRef<HTMLDivElement>(null);
    
    const [pagedMessages, setPagedMessages] = useState<MessageModel []> ([])

    const handleMouseOver = () => mouseIsOver.current = true
    const handleMouseLeave = () => {
        mouseIsOver.current = false
        bottomRef.current?.scrollIntoView({});
    }

    const firstMessagesReceived = useRef (false)

    React.useEffect(() => {
        
        if (!mouseIsOver.current || firstMessagesReceived.current === false) {
            bottomRef.current?.scrollIntoView({});
        }   

        if (props.messages.length > 0) {
            firstMessagesReceived.current = true
        }

    }, [props.messages]);

    const handleScroll = (e : React.UIEvent<HTMLDivElement>) => {

        if (props.messages.length === 0) {
            return
        }
        
        const checkScrolledToBottom = () => boardRerf.current!.scrollHeight - boardRerf.current!.scrollTop - boardRerf.current!.clientHeight === 0

        if (checkScrolledToBottom ()) {
            setPagedMessages ([])
            allPagesReceived.current = false
        }
    }

    const handleWheelIsBusy = useRef (false)

    const handleWheel = (e : React.WheelEvent<HTMLDivElement>) => {

        if (handleWheelIsBusy.current || allPagesReceived.current) {
            return
        }
        
        if (boardRerf.current?.scrollTop === 0) {

            const calculateAfterIndex = () => {
                if (pagedMessages.length > 0) {
                    return pagedMessages[0].index
                }
                else if (props.messages.length > 0) {
                    return props.messages[0].index
                }
                else {
                    return null
                }
            }

            const afterIndex = calculateAfterIndex ()

            if (afterIndex === null) {
                return
            }
            
            handleWheelIsBusy.current = true

            retryPromise (logger, () => SERVER.listMessagesBefore (afterIndex))
                .then (response => {
                    if (response.type === 'success') {
                        if (response.messages.length !== 0) {
                            setPagedMessages (list => [...response.messages,...list])                            
                        }
                        else {
                            allPagesReceived.current = true
                        }

                        boardRerf.current!.scrollTop = 1
                    }
                    else {
                        logger.error ("Invalid pading response", {response})
                    }
                })
                .finally (() => {
                    handleWheelIsBusy.current = false
                })
        }
    }
    
    return (
        <div ref={boardRerf} className={styles.Board} onMouseEnter={handleMouseOver} onMouseLeave={handleMouseLeave} onScroll={handleScroll} onWheelCapture={handleWheel}>
            {pagedMessages.map (item => <Message key={item.id} message={item}/>)}
            {props.messages.map (item => <Message key={item.id} message={item}/>)}
            <div ref={bottomRef} />
        </div>
      )
};
