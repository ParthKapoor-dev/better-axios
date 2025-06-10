import { ApiError, AxiosApi } from "../src/wrapper";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("AxiosApi Wrapper", () => {
  const mock = new MockAdapter(axios);
  const api = new AxiosApi({ baseURL: "https://example.com" });

  afterEach(() => {
    mock.reset();
  });

  it("should handle a successful GET request", async () => {
    mock.onGet("/hello").reply(200, { message: "world" });

    const res = await api.get("/hello");

    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual({ message: "world" });
  });

  it("should handle a 404 error", async () => {
    mock.onGet("/not-found").reply(404, { message: "Not found" });

    try {
      await api.get("/not-found");
    } catch (error) {
      const axiosErr = error as ApiError;
      expect(axiosErr.statusCode).toBe(404);
      expect(axiosErr.message).toBe("Not found");
    }
  });

  it("should attach auth token if set", async () => {
    api.setAuthToken("my-token");
    mock.onGet("/protected").reply((config) => {
      return config.headers?.["Authorization"] === "Bearer my-token"
        ? [200, { auth: "ok" }]
        : [401, { message: "Unauthorized" }];
    });

    const res = await api.get("/protected");
    expect(res.data).toEqual({ auth: "ok" });
  });
});
