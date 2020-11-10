---
layout: post
title: Docker-note
tags: [docker]
---

### 安装

```
sudo apt install apt-transport-https ca-certificates curl gnupg-agent software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

sudo apt-get update

sudo apt-get install docker-ce
```

<!-- more -->

用于验证：

```
sudo docker run hello-world
```

免sudo使用docker：

```
sudo groupadd docker
sudo usermod -aG docker $USER
sudo service docker restart (不需要应该也可以)
newgrp - docker
```

### Dockerfile

Dockerfile（Build）---->Docker Image（ship）---->Containers（Run）

#### Docker Engine Architecture

整个容器化过程涉及到三个主要的东西：Docker Client，Docker Host，Docker Registry

- Docker Client：用户和Docker交互的媒介。Docker CLI，Docker API。

- Docker Host：实际执行容器化任务的机器。跑了一个叫Docker daemon的程序，用来监听并执行Docker client的请求。Docker daemon构建dockerfile并将其转成docker image。dockerfile和docker image可以直接和docker daemon交流。当然docker image也可以由从docker hub push或者pull过来。反正就是说，任务可以被docker host通过docker daemon执行。image也可以作为容器运行，容器可以和docker daemon通过image交流。也就是说，对容器所做的任何更改也会暂时反映在docker映像上。

  ![image-20201107145042787](\images\Docker-note\image-20201107145042787.png)

- Docker Registry：Docker client和Docker host实际上是同一台机器，但是docker client是作为一个被限制于用来传递用户输入并展示docker host的输出的软件。你会发现Docker Registry是docker架构中最简单的一个组件，用来存储docker image并让其对他人开放。![image-20201107145836256](\images\Docker-note\image-20201107145836256.png)

#### Write Dockerfile

dockerfile没有什么特殊的后缀名，通常的规则是将文件命名为`Dockerfile`。通常分为如下图三个部分

![image-20201107150422254](\images\Docker-note\image-20201107150422254.png)

#### Fundamental Instructions

- ARG：用来创建一个变量
- FROM：用来指定将要构建的系统

```dockerfile
ARG CODE_VERSION=20.04
FROM ubuntu:${CODE_VERSION}
RUN apt-get update -y
CMD ["bash"]
```

然后试着通过这个dockerfile来构建image，执行命令`docker build -t img_from .`。`-t`表示的是tag，或者说给这个image取个好认的名字。这里的tag名为img_from，然后后面的点表示dockerfile在当前目录下。成功后会看到

```
Successfully built b3514fe67e97
Successfully tagged img_from:latest
```

执行`docker images`就能看到刚才构建完成的img_from。

#### Configuration Instructions

- RUN：表示在最上面那个指定的镜像中执行命令

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /home/code

ENV USER kobe
ENV SHELL /bin/bash
ENV LOGNAME kobelog

CMD ["bash"]
```

然后执行`docker build -t img_run-env .`，构建成功了，来执行下这个镜像。通过命令

> docker run -itd --name cont_run-env img_run-env

`i`表示interactive，`t`表示teletype enable，`d`表示detached。然后命名为`cont_run-env`。

执行`docker ps -a`可以看到所有在运行的容器。COMMAND那一列可以看到cont_run-env是在运行着bash命令。现在因为启动的时候加了detached flag，所以bash命令是在后台运行的。现在可以通过执行`docker exec -it cont_run-env bash`来将其带到前面来。执行后会发现已经身在这台容器内了，可以看到/home/code目录有被创建，通过ENV创建的那些环境变量都有被创建。`exit`退出。

#### Expose Instructions

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install nginx -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

EXPOSE用来告诉Docker该容器的哪个端口被监听了。然后通过`docker build -t img_expose .`来构建image。运行下面命令来启动容器。

> docker run -itd --rm --name cont_expose -p 8080:80 img_expose

--rm表示当容器停止的时候自动删除。-p 8080:80表示将host的8080端口映射到容器的80端口。成功运行后，在浏览器内访问host的8080端口就可以看到nginx的页面了。

### Docker Images and Container

#### Introduction

关于image的层：

- 最下面的是boot file system，很像linux的boot file system。将image和主机或者云上的其他文件分开。

- 再上面是Base Image Layer。it will follow the file mapping laid out by boot file system.

![image-20201107175611795](\images\Docker-note\image-20201107175611795.png)

#### Docker hub

搜索docker hub上的image：`docker search node`会出来一大堆

如果只看官方的：`docker search node --filter "is-official=true"`

格式化输出：`docker search --format "table {{.Name}}\t{{.IsOfficial}}" node`

将本地的镜像打一个新的tag，准备用来push到docker hub：`docker tag hello-world:latest shoutaku/repo-nginx:myhello`

这个时候，`docker images`查看可以发现刚新打出来的image和原来的那个image有同样的image id，因为docker只是给建立了一个别名，引用的是同一个东西。

push到docker hub：`docker image push shoutaku/repo-nginx:myhello`。就能在线上的tag页面看到刚提交的image了。

#### Know your Docker Images

通常`docker images ubuntu`可以查看到一些像image id和tag等基本信息，`docker image inspect ubuntu:20.4`可以看到更详细的信息，打出来的是一个JSON。上面提到的可以格式化输出的那里的字段貌似就是这个JSON的键值，比如`docker image inspect --format "{{.DockerVersion}}" ubuntu:20.04`

将需要的信息存储出来：`docker image inspect --format "{{json .Config}}" ubuntu:20.04 > configInfo.txt`。Config字段的数据就保存到configInfo中了。

查看镜像构建历史：`docker image history img_expose:latest`会看到image那列有的条目是missing，好像说这是Dockerfile构建的时候产生的，用来做缓存，如果镜像是从docker hub pull下来的，就不会有这个缓存？还有就是那些missing的created那一栏都是很久之前，因为那是别的docker host上构建的，而那些有image id的是本机上构建的。

删除镜像：`docker image rm hello-world:latest`那些中间镜像也会一起被删除掉。或者使用`docker rmi $imageID`

#### Container

- Running Instance of a Docker Image

  什么叫运行实例呢？Run = CPU + Memory + Storage

- Provides similar isolation to VMs but lighter ... A LOT LIGHTER

  每个容器都有自己的boot file system，网络驱动，存储驱动。

- Adds writable layer on top of image layers and works on it.

- Can talk to other containers like processes in Linux

- Use Copy-on-Write

**启动与停止**

`docker container create -it --name cc-busybox-A busybox:latest`

使用busybox;latest镜像创建一个名为cc-busybox-A的容器。

`docker ps -a`可以看到状态是created

为了演示--rm，这里启动容器，并重命名为cc-busybox-B：

`docker container run -itd --rm --name cc-busybox-B busybox:latest`

`docker ps -a`可以看到B已经在运行了。A没有在运行，通过`docker container start cc-busybox-A`启动A，因为最开始的时候用像`-idt`这样的东西创建了容器，所以这个时候可以省略。

停止B：`docker container stop cc-busybox-B`，这个时候ps -a就看不到B这个容器了，因为加了--rm参数，所以停止的时候会被自动删除掉。这是一种主流的用法。停止A，A就不会被删除，然后可以通过`docker container restart cc-busybox-A`来重启这个容器。

`docker container rename cc-busybox-A my-busybox`重命名为my-busybox，这个时候`docker ps -a`会发现状态那列并没有改变，还是之前启动的时间，这说明重命名一个容器并不会重启该容器。

**attach**

`docker container attach my-busybox`就进入了my-busybox的标准输入输出或者说终端。exit退出再ps -a查看，该容器已经停止了。

这个时候再运行起来，`docker container start my-busybox`，通过exec可以直接向容器丢命令：`docker exec -it my-busybox ls`就会执行`ls`命令

**删除**

`docker container rm xxxx`，xxx可以是容器名，或者容器id，可以接多个值，同时删除多个。

`docker container prune`会删掉所有没有在运行的容器

### Docker Network：Connecting Container

容器很好的隔离其他容器，但是通常一个应用会需要多个容器，各自负责不同的功能，这个时候容器之间就需要交流了。

docker网络模型最下面的就是host network infrastructure，这里包括了软件和硬件基础设的施详细内容，like using Ethernet or wifi，and OS kernel network stack。

往上面是Network Drivers和IPAM Drivers

再上面是Docker Engine，创建单个的网络对象。

往上是用户的设置以及默认的容器网络对象

除了最下面的基础设施，上面三层都是docker自己的。

再网上就是在运行的容器了，这些容器都至少有一个end point，说到端点，它们是虚拟以太网的容器侧连接器表示，这是跨docker进行联网的通用协议（speaking of end point, they are container side connector representation of virtual ethernet which is the common protocol for networking across docker）。他们有像ip地址，虚拟物理地址，以及端口这样的东西。

![image-20201108213627340](\images\Docker-note\image-20201108213627340.png)

如果一个容器连接了不止一个网络，那么他就会有不止一个相关的有着不同ip的endpoint。在单主机实现的情况下，ip的范围（scope）通常被限制在主机。

同一个scope内，如果两个容器连接到了同一个网络，他们可以通过DNS来交流，并且容器名可以用来替代ip。容器会提供这些信息给Network Drivers和IPANM Drivers，然后这两个玩意会把这个请求翻译成主机网络支持的数据包，并且传输出去，确保容器可以和外面的世界进行交流。如果没有这些个玩意，你连apt-get update都执行不了。

#### Docker Native Network Drivers

![image-20201108213731800](\images\Docker-note\image-20201108213731800.png)

这是上面的一张图收缩后的样子，