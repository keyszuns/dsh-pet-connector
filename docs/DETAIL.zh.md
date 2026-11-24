# 大肥鱼世界连接器

[English](DETAIL.en.md) | 中文

把本机正在跑的 **dsh-pet** 接进「大肥鱼世界」。连接器不修改 dsh-pet、不打包它的素材，只通过 dsh-pet 自带的本地 HTTP 扩展面（`/dsh-pet-7340/*`）读状态、写打工状态、让宠物说话。

## 功能

- **设备码配对**：右键宠物 →「打开大肥鱼世界」→ 生成配对码 → 浏览器加入 → 自动上线
- **换电脑恢复**：大肥鱼ID + 恢复码，在 `/recover` 把账号接到新电脑
- **加入页**：协议、手动选择城市、填写生日；不获取定位
- **五行**：生日算生肖与纳音，城市按大区算五行
- **班次**：15/30/60 分钟，服务端按秒结算
- **鱼本**：单人/组队，Lv10 解锁，每日次数与掉落
- **装备/商店**：购买、强化、穿戴、分解、套装、图鉴
- **三 Tab 面板**：我的鱼 / 世界 / 背包
- **社交**：好友、排行、世界频道、私信、串门、组队
- **关于页**：中英文介绍、版本、手动更新、每 24 小时自动更新

## 隐私边界

- 不请求定位、不接收经纬度、不调用地图服务
- 不读取用户文件、DSH 会话、模型密钥、剪贴板或进程
- 只读写自己的 `~/.dsh/dsh-pet-connector/state.json`
- 只访问配置里的 `platformUrl` 与本地 dsh-pet 接口

## 安装

1. 先安装并启用 [`dsh-pet`](https://www.npmjs.com/package/dsh-pet)。
2. 在 DSH 插件页安装本连接器：

```sh
dsh plugin --profile web add github:keyszuns/dsh-pet-connector
```

或在 **插件 → 添加插件 → 安装第三方插件** 中输入：

```text
github:keyszuns/dsh-pet-connector
```

3. 启用 `dsh-pet-connector`，打开任意会话。
4. 右键桌面宠物 →「打开大肥鱼世界」→ 生成配对码 → 浏览器加入。

## 配置

| 键 | 默认值 | 说明 |
|---|---|---|
| `platformUrl` | `https://fish.virtuallife.cloud` | 大肥鱼世界地址 |
| `petId` | `main` | 本机 dsh-pet 实例 id |
| `petName` | `大肥鱼` | 首次配对显示名 |

## 更新

面板「关于」页提供 **检查更新 / 立即更新 / 每 24 小时自动更新**。更新走 `dsh-market` 的公共更新 API v1；未安装 dsh-market 时会显示不可用。

要求 DSH 0.2.1+。开发与安装说明见 [README](../README.md)。
