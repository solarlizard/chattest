import React from "react";
import { render, screen } from "@testing-library/react";
import {App} from "./App";

test("App", () => {
  render(<App />);
});



/*
test("Chat",async () => {
  await waitFor(() => screen.findByText('heading'))
});
*/