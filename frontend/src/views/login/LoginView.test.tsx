import { initFixtures } from "../../../testUtils/initTest";

beforeEach(initFixtures);

test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
});
