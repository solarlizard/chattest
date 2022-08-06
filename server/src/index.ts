import { Container } from "./Container";

new Container ().start ()
  .catch (error => {
    console.error (error)
    process.exit (0)
  })