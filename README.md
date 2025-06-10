<!-- Banner Image -->
<p align="center">
  <img src="assets/better-axios.png" alt="better-axios banner" width="100%" />
</p>

<br />

<h1 align="center">⚡️ better-axios</h1>

<p align="center">
  A modern, typed wrapper around Axios — with clean APIs, built-in token management, interceptors, and smart global handlers.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@parthkapoor-dev/better-axios">
    <img src="https://img.shields.io/npm/v/@parthkapoor-dev/better-axios?color=%2300b894&style=flat-square" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@parthkapoor-dev/better-axios">
    <img src="https://img.shields.io/npm/dt/@parthkapoor-dev/better-axios?color=%236c5ce7&style=flat-square" alt="npm downloads" />
  </a>
  <a href="https://github.com/parthkapoor-dev/better-axios">
    <img src="https://img.shields.io/github/stars/parthkapoor-dev/better-axios?style=flat-square" alt="GitHub stars" />
  </a>
</p>

---

## 🚀 Why better-axios?

> Say goodbye to repetitive axios setup in every project.
> `better-axios` helps you build scalable APIs faster with features like:

- ✅ Global and custom error/success handlers
- ✅ Token-based auth with automatic header injection
- ✅ Type-safe responses with custom error types
- ✅ Request/response interceptors
- ✅ Easy-to-extend and override
- ✅ Built-in support for UI feedback patterns

---

## 📦 Installation

```bash
npm install @parthkapoor-dev/better-axios
# or
yarn add @parthkapoor-dev/better-axios
````

---

## ✨ Features

* 📚 Fully typed API with TypeScript
* 🔐 Token auth with prefix config (`Bearer`, etc.)
* 🔁 Interceptors (great for refresh tokens)
* ⚠️ Global & local success/error handlers
* 🔧 Easy to use `setDefaultHeader()`, `removeAuthToken()`, etc.
* 📦 Minimal bundle, no runtime dependencies except `axios`

---

## 🧪 Basic Usage

```ts
import { AxiosApi } from "@parthkapoor-dev/better-axios"

const api = new AxiosApi({
  baseURL: "https://api.example.com",
})

api.get("/users").then((res) => {
  console.log(res.data)
})
```

---

## 📄 Full Documentation

> 👉 **Explore the full docs here:**
> **[https://better-axios.parthkapoor.me](https://better-axios.parthkapoor.me)**

* Getting Started
* Auth Token Management
* Interceptors (Request / Response)
* Global vs Custom Handlers
* Error Handling Strategies
* Recipes & Use Cases

---

## 🛠 Contributing

Found a bug or have a feature request?
We welcome contributions!

```bash
# clone the repo
git clone https://github.com/parthkapoor-dev/better-axios.git

# install deps
npm install

# run tests
npm run test
```

---

## 📄 License

MIT License © [Parth Kapoor](https://github.com/parthkapoor-dev)
