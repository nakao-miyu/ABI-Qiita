---
title: API Gatewayがないとどうなる？-Kong Gatewayで触ってみる-
tags: 
  - 'Kong'
  - 'APIGateway' 
  - '新卒エンジニア'
private: false
updated_at: ''
id: null
organization_url_name: abi-tech
slide: false
ignorePublish: false
---
### 🌸はじめに
弊社ABIがKong社とパートナーシップを締結しました。
そのため、社内でKong API GatewayやKong AIなどといった言葉をよく耳にしますが
一体それって何をやっているの？という段階なので、
まずは、基礎であるAPI Gatewayについて
Kong Gatewayを最小限の構成で触ってみて理解できればなと思っています。

### 🌏API Gatewayがないとどうなるの？

APIをそのまま公開すると、誰でも叩ける、何回でも叩ける、プログラム（Bot）でも叩ける
といった状態が生まれてしまいます。
これでは、「誰がAPIを叩いているのかわからない」「大量のリクエストを防げない」
「想定外のコストや負荷が発生する」などの問題が、起こる可能性があります。

これらを防ぐためには、アプリケーション側で認証チェックや回数制限、
ログ出力といった処理を実装する必要があります。

しかし、APIを複数持つ場合、
これらの処理をAPIごとに個別に実装する必要があります。

...これはしんどい。

もしAPI Gatewayがなければ、すべて自前開発になり、工数は膨れ上がり
運用の大変さ、セキュリティリスクも高くなります。

参照：https://security.i-standard.jp/post/api-security-basics

### 🦍ここで登場するのがAPI Gateway
ここで登場するのがAPI Gatewayです
API GatewayはAPIの前に置く「共通の入り口」のイメージがわかりやすいと思います

APIを直接叩かせるのではなく、すべてのリクエストを一度 API Gateway に通します。

これにより、認証・制限・ログといった共通処理を
API Gateway 側に集約できます。

API Gatewayの代表的なものとして、AWS API Gateway、Azure APIMなどの
クラウドマネージド型や

Kong Gateway、Tyk,GraviteeなどのOSS型があります。
パートナーシップ締結をしている会社であること、手元の環境で基礎を学ぶことを理由に
高性能かつ拡張性がある「Kong Gateway」を題材に取り上げたいと思います。

公式HP：https://jp.konghq.com/

### 🪐最小構成で触ってみる
API GatewayをDBなしのモードで起動し、KongがAPIの入口として動作することを
最小構成で確認してみます。
設定はyamlファイルで定義し、dockerコンテナとして起動します

１．Kongの設定ファイル（Kong.yml）を作成

テスト用の転送先として httpbin.org を利用します。
/test というパスで受けたリクエストを、
httpbin.org にルーティングする設定を行います。
```
_format_version: "3.0"
services:
  - name: httpbin
    url: https://httpbin.org
    routes:
      - name: httpbin-route
        paths:
          - /test
```

2.KongをDockerで起動

3.Kong経由でAPIを呼ぶ
Kongを通してAPIを叩いてみます
```
curl http://localhost:8000/test/get
```
返ってきたレスポンスは以下の通りです

```
{
  "headers": {
    "Accept": "*/*",
    "Host": "httpbin.org",
    "X-Forwarded-Host": "localhost",
    "X-Forwarded-Path": "/test/get",
    "X-Forwarded-Prefix": "/test",
    "X-Kong-Request-Id": "xxxxxx"
  },
  "origin": "172.17.0.1, xxx.xxx.xxx.xxx"
}
```

localhost:8000にアクセスしたところ、Kongが/testを検知、
httpbin.orgにリクエストを転送して、レスポンスがKong経由で返ってくるという
KongがAPIの入口として、機能していることが確認できました！

### 🏰まとめ
今回やったことはとてもシンプルですが
Kong GatewayをAPIの前段に置く、
ルーティングを定義する
だけで、APIの入口を一元管理できることが分かりました。

今後は、この基礎の上に積み重なる、認証、レート制限などの学習をしたいと思います。