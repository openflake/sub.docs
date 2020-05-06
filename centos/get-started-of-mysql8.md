# MySQL8.0 安装与配置

## 一. 检查旧版本

查看是否安装过MySQL：

```bash
rpm -qa | grep -i mysql
```

强力卸载已安装的包：

```bash
rpm -e --nodeps [包名]
```

## 二. 安装新版本

从官网下载rpm安装包：

```bash
wget http://dev.mysql.com/get/mysql-community-server-8.0.20-1.el7.x86_64.rpm
wget http://dev.mysql.com/get/mysql-community-client-8.0.20-1.el7.x86_64.rpm
wget http://dev.mysql.com/get/mysql-community-common-8.0.20-1.el7.x86_64.rpm
wget http://dev.mysql.com/get/mysql-community-libs-8.0.20-1.el7.x86_64.rpm
```

按以下顺序（依赖关系）逐一安装：

```bash
rpm -ivh mysql-community-common-8.0.20-1.el7.x86_64.rpm
rpm -ivh mysql-community-libs-8.0.20-1.el7.x86_64.rpm
rpm -ivh mysql-community-client-8.0.20-1.el7.x86_64.rpm
rpm -ivh mysql-community-server-8.0.20-1.el7.x86_64.rpm
```

查看是否安装成功：

```bash
mysqladmin --version
```

## 三. 初始化

初始化目的是创建数据文件目录和系统数据库、产生随机root密码。

```bash
mysqld --initialize
```

尝试启动：

```bash
systemctl start mysqld
```

如果启动失败，可能原因有：

1. 未授予mysql目录权限，解决方法：

   ```bash
   chown -R mysql:mysql /var/lib/mysql/
   ```

2. 升级后的数据文件与旧版本冲突，简单粗暴的解决方法是直接删除数据目录（对于已经存在生产数据的情况需通过其他方式处理）：

   ```bash
   rm -rf /var/lib/mysql/
   ```

## 四. 安全设置

查看初始化随机生成的root密码：

```bash
cat /var/log/mysqld.log | grep password
```

进入安全设置程序：

```bash
mysql_secure_installation
```

以上命令执行后会出现如下选择：

1. 提示输入密码，刚安装没有密码则直接回车
2. 是否设置root密码：Y
3. 是否删除系统创建的匿名用户：Y
4. 是否禁止root用户远程登录：n
5. 是否删除test数据库：Y
6. 是否重载权限表：Y
7. 完成。

## 五. 修改密码

```text
mysql -uroot -ppassword
use mysql;
update user set authentication_string='' where user='root';
ALTER USER root@localhost IDENTIFIED WITH mysql_native_password BY 'newpassword';
flush privileges;
```

## 六. 字符集设置

`vi /etc/my.cnf` 打开配置文件，在 `[mysqld]` 段增加：`character_set_server = utf8`，重启MySQL后登入mysql查看编码设置结果：`show variables like 'character%';`

## 七. 基本操作

### 1. 开机启动及日常启停

```bash
systemctl enable mysqld
systemctl start mysqld
systemctl stop mysqld
systemctl restart mysqld
```

### 2. 创建数据库和表

```text
create database [db_name] character set utf8;
use db_name;

drop table if exists user;
create table user (
  openId      char(32)      not null,
  nickname    varchar(20)   not null default '',      # 昵称
  createTime  datetime      not null default now(),   # 创建时间
  status      tinyint       not null default 0,       # 用户状态
  primary key (openId)
) engine = InnoDB, default charset = utf8;
```

### 3. 导出数据库

```sql
mysqldump -uroot -p db_name > /file/path/filename.sql
```

