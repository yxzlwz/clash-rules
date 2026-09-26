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

## default 模板的分组

- `Advertisement`：广告拦截分组，命中 [AWAvenue-Ads-Rule](https://github.com/TG-Twilight/AWAvenue-Ads-Rule) 的流量走这里。该规则集是 `rules` 的第一条，默认选项为 `REJECT`；某个被拦截的域名确实需要访问时，把该分组切换为 `DIRECT` 或 `🚀 Proxy` 即可。
- 所有 `select` 分组都带有 `DIRECT` 选项。因此无需关闭 Clash 就能只代理某一个分组：把 `🚀 Proxy` 选为 `DIRECT`（以它为默认选项的分组会一起直连），再把要代理的那个分组单独选成 `Auto` 或某个地区分组。

## 本地开发与部署

```bash
npm install
npm test
npm run dev
npm run deploy
```

部署后可在 Cloudflare Dashboard 的 Worker 设置中为该 Worker 添加 `rules.yxzl.dev` 自定义域名。
