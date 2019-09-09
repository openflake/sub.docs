---
title: 常用命令
---

# CentOS 常用命令

#### 查看开机启动项

```bash
systemctl list-unit-files | grep enabled
```

#### 查看相关服务状态

```bash
systemctl list-units --type=service | grep -E "nginx|php-fpm|mysql|memcached|syncthing"
```

#### 查看相关服务进程

```bash
ps -ef | grep -E "nginx|php-fpm|mysql|memcached|syncthing"
```

#### 查看所有监听端口

```bash
netstat -tunpl
```

#### 查看开机启动项耗时

```bash
systemd-analyze blame
```

#### 查看CPU内存使用情况

```bash
top # CTRL+M 排序
```

#### 查看磁盘使用情况

```bash
df -h
```

#### 查看目录大小

```bash
du -sh xxx
```

#### 统计当前目录下文件的个数（包括子目录）

```bash
ls -lR | grep "^-" | wc -l
```

#### 查看 php-fpm 进程树（配置的上限是30）

```bash
pstree | grep php-fpm
```

#### 查看 php-fpm 慢日志

```bash
tail -f /var/log/php-fpm/www-slow.log
```

### 彻底卸载软件

1. 查看最近安装的软件包并卸载

```bash
rpm -qa --last > ~/last.txt
yum list installed > ~/installed.txt
yum -y remove xxx
yum clean all
```

2. 查看是否有新增用户并删除

```bash
cat /etc/passwd
userdel -r xxx
```

3. 查看是否有残留并删除

```bash
find / -name xxx
rm -rf xxx
```

