# 项目维护约定

## 用户偏好

- README 写给使用者：先说明用途和实际用法，再写部署及必要限制。中文要自然，避免把开发过程、实现清单和验证报告塞进去。
- 实现细节、维护提醒放在本文件。README 的改写使用 `better-readme` 技能。
- `test/` 只保留在本地，已加入 `.gitignore`。不要强制添加或提交测试文件；原来已跟踪的测试也已取消跟踪。
- 保留会话中已有的工作，修改前查看 `git status` 和相关 diff。不要覆盖用户未提交的调整。

## 模板与接口

- `configs/default.yaml`、`configs/ai-only.yaml` 是不含订阅的完整配置模板，保留规则、规则集、代理组、DNS 等设置。不放节点、订阅地址或字符串占位符。
- 用 `yaml` 的 `parseDocument` 解析模板，以 `setIn` 注入 provider，再序列化。保留注释，不退回字符串替换。每次请求使用独立文档，避免订阅串到其他请求。
- `/clash` 要求 `name` 和 HTTP(S) `url`。provider 位于 `proxy-providers[name]`，类型为 `http`，路径为 `./providers/${name}.yaml`，更新间隔为 43200 秒。
- Worker 不转换节点格式；客户端仍通过 provider URL 下载节点。原订阅应返回带 `proxies` 字段的 Clash/Stash YAML。
- `/clash-template` 只返回所选模板，不要求 `name` 或 `url`，也不访问上游。它不是只含规则列表的规则集文件。
- 两个接口共用模板选择：`config` 优先于 `template`，都省略时为 `default`。空字符串和未知模板名返回 400。
- `openai-only` 是 `ai-only` 的兼容别名。不要删除这个映射，否则已导入的订阅链接会在刷新时失败。provider 名称、URL 和缓存路径也应保持兼容。
- 两个接口允许 GET、HEAD，HEAD 不返回正文；其他方法返回 405，未知路径返回 404。
- 新增模板时同步更新 `src/index.js` 的模板映射、`src/templates.js` 的可选名称以及 README 的模板表。
- Wrangler 将 YAML 作为 Text 模块导入；入口是 `src/index.js`，配置见 `wrangler.toml`。

## 订阅信息

- 配置订阅卡片通常读取下载响应的 `Subscription-Userinfo`，不能假定 provider 信息会自动显示到卡片上。
- 查询先用 HEAD；失败、不支持或没有信息时尝试 GET，两次共用 5 秒截止时间。只读取响应头，取消响应正文，不缓存服务信息。
- 上游缺少信息、报错或超时时仍返回正常配置。不要伪造流量或到期时间，保留零值和缺失字段。
- `upload`、`download`、`total` 是字节，`expire` 是 Unix 秒时间戳。已用量是上传加下载；剩余量由客户端计算。
- 统一分号后的空格，以兼容旧客户端；只接收成功响应的服务信息。
- User-Agent 包含 clash、mihomo、stash 或 nyanpasu 时保留，其他情况使用 `clash`。仅传 User-Agent，不转发 Cookie 或 Authorization。
- Cloudflare 出口可能被订阅服务器限制。不要把本地客户端可访问当作 Worker 可访问的证明，也不要把模拟测试当作真实订阅验证。

客户端查询方式和来源：

| 客户端 | 信息入口 |
| --- | --- |
| [Stash](https://stash.wiki/features/service-provider-subscription) | 优先从配置更新 URL 获取服务信息，优先使用 HEAD；没有更新 URL 时查询 provider URL |
| [Clash Verge Rev](https://www.clashverge.dev/guide/url_schemes.html) | 配置下载响应的 `Subscription-Userinfo` |
| [Clash Party](https://clashparty.org/docs/guide/urlscheme) | 配置下载响应的 `Subscription-Userinfo` |
| [Mihomo](https://github.com/MetaCubeX/mihomo/blob/Meta/adapter/provider/provider.go) | provider 响应的服务信息，经 `subscriptionInfo` 提供给面板 |

## 规则维护

- 通用模板使用 `include-all` 收集节点；修改分组时注意 Stash/Mihomo 兼容性。
- 所有 `select` 分组保留 `DIRECT`。Advertisement 默认 REJECT；它使用的 [AWAvenue-Ads-Rule](https://github.com/TG-Twilight/AWAvenue-Ads-Rule) 位于 rules 首条。
- 微信使用 `WeChat_No_Resolve.yaml`。更新国内分流时不要无意改变这个选择。
- `ai-only` 的规则顺序是 OpenAI 规则集、Claude 规则集、MATCH DIRECT。两类服务使用独立分组，保持其余流量直连。

## 验证

- 本地测试存在时运行 `npm test`。新克隆不会带上测试，零项测试不代表验证通过。
- 对注入逻辑，比较解析后的配置，验证规则保留、URL 安全往返、请求隔离，以及已有 provider 不被清空。
- 接口检查覆盖两套模板、两个参数名、默认值、参数优先级、GET/HEAD、无效输入，以及模板接口不访问上游。
- 订阅信息检查覆盖 HEAD 到 GET 回退、超时、缺失信息和失败时仍返回配置。
- 打包检查：`npx wrangler deploy --dry-run`。受限环境可指定 `WRANGLER_LOG_PATH=/tmp/clash-rules-wrangler.log`，避免日志写入用户目录失败。
- 修改文档后检查相对链接和 `git diff --check`。部署、提交或推送后才报告相应动作已完成。
