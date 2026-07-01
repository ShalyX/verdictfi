import { beforeEach } from "vitest";

beforeEach(() => {
  delete process.env.SOSOVALUE_API_KEY;
  delete process.env.SODEX_TESTNET_API_KEY;
  delete process.env.SODEX_TESTNET_PRIVATE_KEY;
});
