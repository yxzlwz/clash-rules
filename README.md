# Clash Rules Worker

返回将请求参数写入指定 Clash/Mihomo 模板后的配置。

## 使用

```
https://<你的域名>/clash?name=my_airport&url=https%3A%2F%2Fexample.com%2Fsubscribe%3Ftoken%3Dxxx
```

`name` 仅可使用字母、数字、`-` 和 `_`；`url` 必须是 HTTP 或 HTTPS URL。请始终对 `url` 做 URL 编码。

使用 `config` 参数选择模板：

- `default`（或省略）：完整的通用分流模板，源文件为 `configs/default.yaml`。
- `openai-only`：只代理 OpenAI 规则集命中的流量，其他流量直连，源文件为 `configs/openai-only.yaml`。

例如：

```
https://<你的域名>/clash?config=openai-only&name=my_airport&url=https%3A%2F%2Fexample.com%2Fsubscribe%3Ftoken%3Dxxx
```

## 本地开发与部署

```bash
npm install
npm test
npm run dev
npm run deploy
```

部署后可在 Cloudflare Dashboard 的 Worker 设置中为该 Worker 添加 `rules.yxzl.dev` 自定义域名。
