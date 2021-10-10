import { Lens } from "monocle-ts";
import { patchObjArrayById } from "./objects";

type Child = { id: number; value: string };
const childrenBefore: Child[] = [
  {
    id: 1,
    value: "one",
  },
  {
    id: 2,
    value: "two",
  },
  {
    id: 3,
    value: "worng",
  },
];

const fix: Child = {
  id: 3,
  value: "three",
};

const expectedChildren: Child[] = [
  {
    id: 1,
    value: "one",
  },
  {
    id: 2,
    value: "two",
  },
  {
    id: 3,
    value: "three",
  },
];

describe("objects", () => {
  describe("patchObjArrayById", () => {
    test("plain usage", () => {
      const patchChildren = patchObjArrayById<Child>(fix);
      const newChildren = patchChildren(childrenBefore);
      expect(newChildren).toEqual(expectedChildren);
    });

    test("with lenses", () => {
      const parent = {
        children: childrenBefore,
      };

      const childrenL = Lens.fromProp<typeof parent>()("children");
      const newParent = childrenL.modify(patchObjArrayById<Child>(fix))(parent);

      expect(newParent).toEqual({ children: expectedChildren });
    });
  });
});
