import { Compo } from "../rust-types/Compo";
import { CompoUpdate } from "../rust-types/CompoUpdate";

export const compoToCompoUpdate = (compo: Compo): CompoUpdate => ({
  title: compo.title,
  description: compo.description,
  state: compo.state,
});
