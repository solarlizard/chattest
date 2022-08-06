import React from "react";
import { render, screen } from "@testing-library/react";
import {App} from "./App";

test("App", () => {
  window.HTMLElement.prototype.scrollIntoView = function() {};
  (window as any).setImmediate = () => {}

  render(<App />);
});
