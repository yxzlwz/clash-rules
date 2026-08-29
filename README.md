# Clash Rules Worker

返回将请求参数写入 `config.yaml` 模板后的 Clash/Mihomo 配置。

## 使用

```
https://<你的域名>/clash?name=my_airport&url=https%3A%2F%2Fexample.com%2Fsubscribe%3Ftoken%3Dxxx
```

`name` 仅可使用字母、数字、`-` 和 `_`；`url` 必须是 HTTP 或 HTTPS URL。请始终对 `url` 做 URL 编码。

## 本地开发与部署

```bash
npm install
npm test
npm run dev
npm run deploy
```

部署后可在 Cloudflare Dashboard 的 Worker 设置中为该 Worker 添加 `rules.yxzl.dev` 自定义域名。
