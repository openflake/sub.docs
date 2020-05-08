# Google API 启用与授权

## 一. 启用谷歌 API

登录谷歌后进入 [https://console.developers.google.com/apis/api/drive.googleapis.com/overview](https://console.developers.google.com/apis/api/drive.googleapis.com/overview) 页面，点击启用，然后创建 OAuth 客户端 ID，应用类型选“其他”。创建成功后会生成客户端 ID 和客户端 Secret，将其保存。

## 二. 生成 API 授权码

对于第三方应用来说，API 授权大致过程（仅列举主要参数）是：

1. 通过 client\_id  获取 code；
2. 通过 client\_id、cilent\_secret、code 获取 access\_token 和 refresh\_token
3. 通过 access\_token 调用 API
4. 当 access\_token 过期时，通过 refresh\_token 刷新 access\_token

所以授权的核心是获取 refresh\_token，可通过 Restful API 方式，也可利用`Rclone`工具，详见 [Rclone 安装与使用](https://app.gitbook.com/@status/s/tech-docs/centos/get-started-of-rclone#er-pei-zhi-google-drive)，进入`rclone.conf`配置文件查看。

