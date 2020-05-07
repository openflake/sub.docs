# Google API 启用与授权

## 一. 启用谷歌 API

登录谷歌后进入 [https://console.developers.google.com/apis/api/drive.googleapis.com/overview](https://console.developers.google.com/apis/api/drive.googleapis.com/overview) 页面，点击启用，然后创建 OAuth 客户端 ID，应用类型选“其他”。创建成功后会生成客户端 ID 和客户端 Secret，将其保存。

## 二. 生成 API 授权码

对于第三方应用来说，API 授权大致过程（仅列举主要参数）是：

1. 通过 client\_id  获取 code；
2. 通过 client\_id、cilent\_secret、code 获取 access\_token 和 refresh\_token
3. 通过 access\_token 调用 API
4. 当 access\_token 过期时，通过 refresh\_token 刷新 access\_token

所以授权的核心是获取 refresh\_token，可通过 Restful API 方式，也可使用如下所示`Rclone`工具。

### 1. 安装 Rclone

```bash
yum install p7zip unzip -y
curl https://rclone.org/install.sh | bash
```

### 2. 配置 Rclone

执行`rclone config`命令，会出现以下看似复杂其实很容易操作的信息，需要填写或选择的部分见注释：

```bash
n) New remote
s) Set configuration password
q) Quit config
n/s/q> n    # 创建一个新的配置
name> gdapi # 随便取一个配置名称
Type of storage to configure.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / 1Fichier
   \ "fichier"
 2 / Alias for an existing remote
   \ "alias"
 3 / Amazon Drive
   \ "amazon cloud drive"
 4 / Amazon S3 Compliant Storage Provider (AWS, Alibaba, Ceph, Digital Ocean, Dreamhost, IBM COS, Minio, etc)
   \ "s3"
 5 / Backblaze B2
   \ "b2"
 6 / Box
   \ "box"
 7 / Cache a remote
   \ "cache"
 8 / Dropbox
   \ "dropbox"
 9 / Encrypt/Decrypt a remote
   \ "crypt"
10 / FTP Connection
   \ "ftp"
11 / Google Cloud Storage (this is not Google Drive)
   \ "google cloud storage"
12 / Google Drive
   \ "drive"
13 / Google Photos
   \ "google photos"
14 / Hubic
   \ "hubic"
15 / JottaCloud
   \ "jottacloud"
16 / Koofr
   \ "koofr"
17 / Local Disk
   \ "local"
18 / Mega
   \ "mega"
19 / Microsoft Azure Blob Storage
   \ "azureblob"
20 / Microsoft OneDrive
   \ "onedrive"
21 / OpenDrive
   \ "opendrive"
22 / Openstack Swift (Rackspace Cloud Files, Memset Memstore, OVH)
   \ "swift"
23 / Pcloud
   \ "pcloud"
24 / Put.io
   \ "putio"
25 / QingCloud Object Storage
   \ "qingstor"
26 / SSH/SFTP Connection
   \ "sftp"
27 / Union merges the contents of several remotes
   \ "union"
28 / Webdav
   \ "webdav"
29 / Yandex Disk
   \ "yandex"
30 / http Connection
   \ "http"
31 / premiumize.me
   \ "premiumizeme"
Storage> 12    # 选择 Google Drive，注意该序列号可能会变化，看清楚自己所需
client_id>     # 在启用谷歌 API 页面上生成的客户端 ID
client_secret> # 在启用谷歌 API 页面上生成的客户端 Secret
Choose a number from below, or type in your own value
 1 / Full access all files, excluding Application Data Folder.
   \ "drive"
 2 / Read-only access to file metadata and file contents.
   \ "drive.readonly"
   / Access to files created by rclone only.
 3 | These are visible in the drive website.
   | File authorization is revoked when the user deauthorizes the app.
   \ "drive.file"
   / Allows read and write access to the Application Data folder.
 4 | This is not visible in the drive website.
   \ "drive.appfolder"
   / Allows read-only access to file metadata but
 5 | does not allow any access to read or download file content.
   \ "drive.metadata.readonly"
scope> 2 # 选择授权范围：全部、只读、读写等等
ID of the root folder
Leave blank normally.
Fill in to access "Computers" folders. (see docs).
Enter a string value. Press Enter for the default ("").
root_folder_id> # 根目录 ID，置空即可
Service Account Credentials JSON file path 
Leave blank normally.
Needed only if you want use SA instead of interactive login.
Enter a string value. Press Enter for the default ("").
service_account_file> # 服务账号 JSON 文件路径，置空即可
Edit advanced config? (y/n)
y) Yes
n) No
y/n> n # 是否进入高级配置，否即可
Remote config
Use auto config?
 * Say Y if not sure
 * Say N if you are working on a remote or headless machine
y) Yes
n) No
y/n> n # 是否使用自动配置，否即可
If your browser doesn't open automatically go to the following link: https://accounts.google.com/o/  #打开该地址获取code
Log in and authorize rclone for access
Enter verification code>  # 此步骤会出现回调 URL 链接，将此链接复制到浏览器会请求登录谷歌，并询问是否同意授权，同意后会得到 code
Configure this as a team drive?
y) Yes
n) No
y/n> n # 将配置设为团队云盘的，否即可
--------------------
[gdapi]
type = drive
client_id = 
client_secret = 
scope = drive.readonly
token = {}  # 此步骤会显示最终结果，复制其中的 refresh_token 供 API 使用
--------------------
y) Yes this is OK
e) Edit this remote
d) Delete this remote
y/e/d> y # 确认结果，是
Current remotes:

Name                 Type
====                 ====
gdapi                drive

e) Edit existing remote
n) New remote
d) Delete remote
r) Rename remote
c) Copy remote
s) Set configuration password
q) Quit config
e/n/d/r/c/s/q> q # 退出
```

此时我们在配置过程中已获取到`refresh_token`参数，如果忘记可以查看配置文件，以下命令用于查看配置文件路径：

```bash
rclone config file | grep rclone.conf
```

