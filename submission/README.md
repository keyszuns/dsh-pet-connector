# Submit to awesome-dsh-plugin / dsh-market

`dsh-market` does not crawl every GitHub repository. Its catalog comes from
[`awesome-dsh-plugin/awesome-dsh-plugin`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin),
so add one entry there after this repository is public.

## 1. Create the GitHub repository

- Repository: `https://github.com/keyszuns/dsh-pet-connector`
- Public repository
- Topics: add **`dsh-plugin`**
- Push this directory as the repository root

The repository must be at least **1 day old** before the entry can be accepted.

## 2. Open a PR to awesome-dsh-plugin

Copy:

```text
submission/keyszuns__dsh-pet-connector.yml
```

to:

```text
data/plugins/keyszuns__dsh-pet-connector.yml
```

in a fork of `awesome-dsh-plugin/awesome-dsh-plugin`.

Content:

```yaml
url: https://github.com/keyszuns/dsh-pet-connector
name: keyszuns/dsh-pet-connector
category: fun
description:
  en: Connects local dsh-pet to Big Fat Fish World with pairing, presence, and a bilingual panel.
  zh: 把本机 dsh-pet 接入大肥鱼世界，支持配对、在线状态和中英文面板。
```

PR body can use:

```text
Adds dsh-pet-connector, a DSH bundle that connects the local dsh-pet desktop pet
to the Big Fat Fish World server. It declares dsh.bundle.patch, has the
dsh-plugin topic, and ships a bilingual README/detail page plus optional
24h update support through dsh-market's public update API v1.
```

## 3. Install command once listed

```sh
dsh plugin --profile web add github:keyszuns/dsh-pet-connector
```

## 4. Updates

`dsh-market` checks a Git install against the repository HEAD and offers
updates on its own page. The connector's About tab can use the same public
update API v1 for its manual check/update and optional 24h auto-update.
