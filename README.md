# Clash Rules Worker

把自己的订阅接上这里的分流规则，生成一份给 Stash 或 Mihomo 使用的配置。部署在 Cloudflare Workers 上，提供通用分流和只代理 OpenAI、Claude 两套模板。

Worker 会直接请求你的订阅，把其中的 `proxies` 写进返回配置。不转换节点格式；原订阅需要能返回带 `proxies` 字段的 Clash/Stash YAML。

## 让 Agent 帮你部署

把下面这段发给能执行终端命令的 Agent，它会帮你部署到自己的 Cloudflare 账号：

```text
帮我把 https://github.com/yxzlwz/clash-rules 部署到我的 Cloudflare Workers。

克隆仓库，阅读 README.md 和 AGENTS.md，安装依赖并检查打包。
检查 Cloudflare 登录状态，未登录时引导我完成登录；如果有多个账号，先让我选择。
使用一个不会覆盖已有 Worker 的名称，保留仓库中的 YAML 导入配置，然后执行部署。
部署后，分别验证 default 和 ai-only 的 /clash-template 接口能返回有效 YAML，
并检查 HEAD 请求正常。最后给我部署地址，以及可以直接导入客户端的 /clash 链接格式。
如果需要我的订阅地址来实测，再向我要，不要把订阅地址或 token 写进仓库。
```

## 怎么用

部署后，把订阅地址放进 `/clash` 的 `url` 参数，再把生成的链接导入客户端：

```text
https://<你的域名>/clash?name=my_airport&url=https%3A%2F%2Fexample.com%2Fsubscribe%3Ftoken%3Dxxx
```

`name` 是这份订阅的名字，可用字母、数字、`-` 和 `_`，长度为 1–64 个字符。`url` 要做 URL 编码。如果想直接下载配置，可以让 curl 帮你处理编码：

```bash
curl --get 'https://<你的域名>/clash' \
  --data-urlencode 'name=my_airport' \
  --data-urlencode 'url=https://example.com/subscribe?token=xxx' \
  -o clash.yaml
```

### 选一套规则

| 模板 | 用途 |
| --- | --- |
| [`default`](configs/default.yaml) | 通用分流，包含国内直连、广告拦截、AI 和流媒体等分组 |
| [`ai-only`](configs/ai-only.yaml) | OpenAI 和 Claude 规则命中的流量走代理，其余直连 |

不选就是 `default`。想只代理 OpenAI 和 Claude，在链接里加上 `config=ai-only`。也可以写成 `template=ai-only`；两者同时出现时，以 `config` 为准。

以前导入的 `openai-only` 链接仍然可用，刷新后会使用 `ai-only` 的规则，无需重新导入。

通用模板里，每个手动选择的分组都有 `DIRECT`。想只代理某一类流量，可以先把 `🚀 Proxy` 设为 `DIRECT`，再把需要的分组切到 `Auto` 或地区节点。原本就默认直连的分组会继续直连。

广告由 `Advertisement` 分组拦截，默认 `REJECT`。遇到误拦，把它切到 `DIRECT` 或 `🚀 Proxy` 即可。

### 只下载模板

如果想自己添加节点，直接下载不带节点的模板：

```bash
curl 'https://<你的域名>/clash-template?config=ai-only' -o template.yaml
```

省略参数会返回通用模板。规则、代理组和 DNS 等设置都在，自行补上节点后才能使用代理。

## 自己部署

需要 Node.js、npm 和 Cloudflare 账号。在项目目录执行：

```bash
npm install
npm run deploy
```

把上面例子中的域名换成部署得到的地址。需要自定义域名时，在 Cloudflare Dashboard 的 Worker 设置里添加即可。本地预览用 `npm run dev`。

## 流量和到期时间

原订阅提供流量和到期信息时，Worker 会在同一次订阅请求里带给客户端，刷新订阅后即可查看。原订阅没有这些信息时，配置仍可下载，只是看不到服务信息。原订阅不允许 Cloudflare Worker 访问，或返回的不是可用 Clash/Stash YAML 时，`/clash` 会失败。客户端能访问订阅，不代表 Worker 也能访问。

订阅请求最多等待 5 秒。模板下载接口不请求订阅，也不返回流量信息。

两个接口都支持 GET 和 HEAD。模板名写错、订阅地址无效，或 `/clash` 缺少必填参数时，返回 400。

维护约定和实现细节见 [AGENTS.md](AGENTS.md)。

## 许可证

[MIT](LICENSE)。模板引用的第三方规则集遵循各自仓库的许可证。
