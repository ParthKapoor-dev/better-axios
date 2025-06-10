import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { AxiosApi, ApiError, ApiResponse } from "../src/wrapper";

describe("AxiosApi Full Test Suite", () => {
  let mock: MockAdapter;
  let api: AxiosApi;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    api = new AxiosApi({ baseURL: "https://example.com" });
  });

  afterEach(() => {
    mock.restore();
  });

  it("should make a successful GET request", async () => {
    mock.onGet("/test").reply(200, { message: "Success" });
    const response = await api.get("/test");

    expect(response).toEqual({
      data: { message: "Success" },
      success: true,
      statusCode: 200,
      message: undefined,
    });
  });

  it("should handle GET request errors", async () => {
    mock.onGet("/fail").reply(404, { message: "Not found" });

    try {
      await api.get("/fail");
    } catch (error) {
      const typedError = error as ApiError;
      expect(typedError.statusCode).toBe(404);
      expect(typedError.message).toBe("Not found");
    }
  });

  it("should make POST request with data", async () => {
    mock.onPost("/submit").reply(201, { success: true });
    const response = await api.post("/submit", { name: "test" });
    expect(response.data).toEqual({ success: true });
  });

  it("should make PUT request", async () => {
    mock.onPut("/update").reply(200, { updated: true });
    const response = await api.put("/update", { id: 1 });
    expect(response.data.updated).toBe(true);
  });

  it("should make PATCH request", async () => {
    mock.onPatch("/patch").reply(200, { patched: true });
    const response = await api.patch("/patch", { field: "value" });
    expect(response.data.patched).toBe(true);
  });

  it("should make DELETE request", async () => {
    mock.onDelete("/delete").reply(200, { deleted: true });
    const response = await api.delete("/delete");
    expect(response.data.deleted).toBe(true);
  });

  it("should set and remove auth token", () => {
    api.setAuthToken("abc123");
    expect(api.getAuthToken()).toBe("abc123");
    api.removeAuthToken();
    expect(api.getAuthToken()).toBeNull();
  });

  it("should set and remove default headers", () => {
    api.setDefaultHeader("X-Test", "value");
    expect(api.getAxiosInstance().defaults.headers.common["X-Test"]).toBe(
      "value",
    );
    api.removeDefaultHeader("X-Test");
    expect(
      api.getAxiosInstance().defaults.headers.common["X-Test"],
    ).toBeUndefined();
  });

  it("should update base URL", () => {
    api.updateBaseURL("https://new-url.com");
    expect(api.getAxiosInstance().defaults.baseURL).toBe("https://new-url.com");
  });

  it("should call global success handler", async () => {
    const handler = jest.fn();
    api = new AxiosApi({
      baseURL: "https://example.com",
      globalSuccessHandler: handler,
    });

    mock.onGet("/ok").reply(200, { done: true });
    await api.get("/ok");
    expect(handler).toHaveBeenCalled();
  });

  it("should call global error handler", async () => {
    const handler = jest.fn();
    api = new AxiosApi({
      baseURL: "https://example.com",
      globalErrorHandler: handler,
    });

    mock.onGet("/fail").reply(500, { message: "Server error" });

    try {
      await api.get("/fail");
    } catch (e) {
      expect(handler).toHaveBeenCalled();
    }
  });

  it("should support custom success handler", async () => {
    const handler = jest.fn();
    mock.onGet("/custom").reply(200, { result: true });
    await api.get("/custom", { customSuccessHandler: handler });
    expect(handler).toHaveBeenCalled();
  });

  it("should support custom error handler", async () => {
    const handler = jest.fn();
    mock.onGet("/custom-error").reply(400, { message: "Oops" });

    try {
      await api.get("/custom-error", { customErrorHandler: handler });
    } catch (e) {
      expect(handler).toHaveBeenCalled();
    }
  });

  it("should skip global handlers if skipGlobalHandlers is true", async () => {
    const successHandler = jest.fn();
    const errorHandler = jest.fn();

    api = new AxiosApi({
      baseURL: "https://example.com",
      globalSuccessHandler: successHandler,
      globalErrorHandler: errorHandler,
    });

    mock.onGet("/skip").reply(200, { okay: true });
    await api.get("/skip", { skipGlobalHandlers: true });
    expect(successHandler).not.toHaveBeenCalled();

    mock.onGet("/skip-error").reply(500, { message: "Fail" });
    try {
      await api.get("/skip-error", { skipGlobalHandlers: true });
    } catch (e) {
      expect(errorHandler).not.toHaveBeenCalled();
    }
  });
});
