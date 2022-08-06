import React from "react";

import styles from "./App.module.css"

import {Chat} from "./chat/Chat"

export const App = () => (
    <div className={styles.App}>
        <Chat/>
        <Chat/>
    </div>
)
