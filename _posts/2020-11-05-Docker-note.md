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

  ![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201107145042787.webp)

- Docker Registry：Docker client和Docker host实际上是同一台机器，但是docker client是作为一个被限制于用来传递用户输入并展示docker host的输出的软件。你会发现Docker Registry是docker架构中最简单的一个组件，用来存储docker image并让其对他人开放。![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201107145836256.webp)

#### Write Dockerfile

dockerfile没有什么特殊的后缀名，通常的规则是将文件命名为`Dockerfile`。通常分为如下图三个部分

![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201107150422254.webp)

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

![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201107175611795.webp)

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

![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201108213627340.webp)

如果一个容器连接了不止一个网络，那么他就会有不止一个相关的有着不同ip的endpoint。在单主机实现的情况下，ip的范围（scope）通常被限制在主机。

同一个scope内，如果两个容器连接到了同一个网络，他们可以通过DNS来交流，并且容器名可以用来替代ip。容器会提供这些信息给Network Drivers和IPANM Drivers，然后这两个玩意会把这个请求翻译成主机网络支持的数据包，并且传输出去，确保容器可以和外面的世界进行交流。如果没有这些个玩意，你连apt-get update都执行不了。

#### Docker Native Network Drivers

![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201108213731800.webp)

这是上面的一张图收缩后的样子，这一块内容有不太理解的地方，记录一下结论：多个容器的时候，容器连接网络是通过容器endpoint连接到一个虚拟bridge的，然后这个bridge连接了Host网络。这意味着容器是和Host网络规范隔离的。容器会有不同的ip和host，我们可以定义bridge的ip范围，子网掩码。如果我们不设置这些的话，IPAM drivers会帮我做这些。

然后还有overlay network。说到这个东西，就要跳出single host docker的思维，在工业上使用docker的时候，更多的是看到集群或者docker host集群，这种叫做swarm mode。

有多个host的时候，当combination之间需要联系的时候，就不能只靠追从容器ip了，还得考虑如果把消息带到正确的host，为了解决这个overlay network有两个信息层（layers of information）：

- underlay network：包含host ip的源和目的地的数据
- overlay information：包含容器ip的源和目的地的数据

数据包头将包含host和容器两者的源和目的地数据。

![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201110221456969.webp)

#### Working with docker network

`docker network create --driver bridge my-bridge`创建一个名为my-bridge的bridge网络。

`docker network create --driver bridge --subnet=192.168.0.0/16 --ip-range=192.168.5.0/24 my-bridge-1`再创建一个名为my-bridge-1的bridge网络，并为了更好的比较，加入了一些参数。

`docker network ls`能看到刚创建的这两个了。并且还有一些另外docker自己创建的，用了其他的driver。

### Docker Swarm

如果将多个容器放一个host的话，那么如果host挂了，那全挂了，那就搞多个host，然后多个人管理不同的host，这样首先很不经济，雇这么多人做同一个件事，其次，要保持每个host的同步是个问题。所以最想要的是，希望能一个人通过一个instance同时管理所有的host。

![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201114184936768.webp)

![](/Users/yuijam/Documents/yuijam.github.io/images/Docker-note/image-20201114185156391.webp)

如果一个worker挂了，那麽他的任务会被分配给其他worker，如果后来那个worker又恢复了，那么之前分配出去的任务会再还给他。

#### 使用

- 安装virtualbox

  https://www.virtualbox.org/wiki/Linux_Downloads

  先添加两个key：

  ```
  wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
  wget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -
  ```

  在根据不同的发行版添加源，20.04虽然不是eoan，但是看官网下载的那里，19.01和20.04都是用的eoan：

  ```
  sudo add-apt-repository "deb [arch=amd64] http://download.virtualbox.org/virtualbox/debian eoan  contrib"
  
  sudo apt update
  ```

  安装：

  ```
  sudo apt-get install virtualbox-6.1
  ```

- 安装docker machine

  一个可以用来创建多个host的工具。https://docs.docker.com/machine/install-machine/

  ```
  base=https://github.com/docker/machine/releases/download/v0.16.0 &&
    curl -L $base/docker-machine-$(uname -s)-$(uname -m) >/tmp/docker-machine &&
    sudo mv /tmp/docker-machine /usr/local/bin/docker-machine &&
    chmod +x /usr/local/bin/docker-machine
  ```

  ```
  docker-machine version
  ```

- Set up Nodes

  以virtualbox作为driver创建一个名为manager的node。

  ```
  docker-machine create --driver virtualbox manager
  ```

  执行这个的时候报了个错：说什么VTx/AMD-v没有开启，大概是说虚拟化技术没有开启，我win10下的任务管理器的的性能页面里显示的是虚拟化技术已开启的，但是VirtualBox--->设置--->系统--->处理器--->启用嵌套VT-x/AMD-V是灰色的，这个时候去到VirtualBox的安装目录，执行

  ```
  VBoxManage modifyvm your-vm-name --nested-hw-virt on
  ```

  报命令找不到，但是VBoxManage这个东西又确实存在的话，可以要这样才行

  ```
  .\VBoxManage modifyvm your-vm-name --nested-hw-virt on
  ```

  这样之后再打开虚拟机有可能报错：

  ```
  VMBoxManage command cannot enable nested vt-x/amd-v without nested-paging and unrestricted guest execution
  ```

  用 https://github.com/GNS3/gns3-gui/issues/3032#issuecomment-672571302 解决了。

  ```
  run this at command prompt: bcdedit /set hypervisorlaunchtype off
  turn off windows feature "Virtual Machine Platform"
  reboot
  ```

  但是这样还是不行，卡在了waiting on ip那里。怎么折腾都不行，aws的服务器连安装貌似都挺麻烦的，最后没有办法试了下在windows装吧。

  - 安装docker

    virtualbox已经有了，不用安装，然后在官网找到这个链接安装docker

    https://hub.docker.com/editions/community/docker-ce-desktop-windows/

    装好后，可能说要装个WSL 2 Linux kernel啥的，

    https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel

    正常来说，docker就能运行了。

  - 安装docker-machine

    gitbash下：

    ```
    base=https://github.com/docker/machine/releases/download/v0.16.0 &&
      mkdir -p "$HOME/bin" &&
      curl -L $base/docker-machine-Windows-x86_64.exe > "$HOME/bin/docker-machine.exe" &&
      chmod +x "$HOME/bin/docker-machine.exe"
    ```

    居然很顺利就装好了。然后再次尝试创建node：

    ```
    docker-machine create --driver virtualbox manager
    ```

    居然，就顺利跑下去了。。。。

  manager创建好后，再创建worker-1和worker-2

  ```
  docker-machine create --driver virtualbox worker-1
  docker-machine create --driver virtualbox worker-2
  ```

  `docker-machine inspect manager`能查看详细

- Initialize Swarm

  `docker-machine ssh manager`能进到manager里面，然后在里面初始化swarm

  ```
  docker swarm init --advertise-addr 192.168.99.100
  ```

  带上manager的ip就初始化了swarm，并且会显示当前node被设置为manager，要添加worker到这个swarm中，需要执行`docker swarm join --token.....`什么的，这个东西不用记，执行

  ```
  docker swarm join-token manager
  ```

  就能显示出来。然后ssh进入worker-1和worker-2，执行上面的join命令就能加入到manager的swarm中

- List and inspect node

  manager中执行`docker node ls`就能看到所有node

  `docker node inspect --pretty self`可以看到当前node的信息，self换成worker-1查看worker-1的。

- Creating a service on Swarm

  用nginx镜像创建一个叫做web-server的service，设置映射端口，并复制三份。

  ```
  docker service create --name web-server -p 8080:80 --replicas 3 nginx:latest
  ```

  查看刚创建的service

  ```
  docker service ls
  ```

  查看service中的容器

  ```
  docker service ps web-server
  ```

  会看到一共有三个容器，如果在每个node里执行`docker ps -a`能看到有一个容器在运行。因为这个service是通过cluster部署的，所以负载是平均分配的。

  这个时候浏览器中http://192.168.99.100:8080/就能看到nginx的默认页面了。另外两个worker的ip也一样。

- Draining a Node on Swarm

  如果一个node要做保养，或者是down掉了？

  让一个node离开cluster最安全的方式是drain it。

  让worker-2离开，`docker node ls`可以看到worker-2的状态是drain了。

  ```
  docker node update --availability drain worker-2
  ```

  ```
  docker service ps web-server
  ```

  看到worker-2 shutdown了，并且他之前的容器 web-server.3被转到了worker-1那里，并且这个时候通过之前worker-2的ip访问，还是能看到nginx的页面。

  这个时候如果要移除掉worker-2，在manager上

  ```
  docker node rm worker-2
  ```

  会报错，原因是虽然他的drain的状态，docker is still serve its API。所以要先从Swarm中离开，到worker-2中执行，然后再在manager中rm就没有问题了。

  ```
  docker swarm leave
  ```

- Scaling and Updating Services on Swarm

  当前的web-server是有3个replica的，现在我们加到6个：

  ```
  docker service scale web-server=6
  ```

  ` docker service ps web-server`可以看到6个被平均分配到两个node上了。在node上`docker ps -a`可以看到有三个容器在运行。

  更新镜像：将nginx换成alpine

  ```
  docker service update --image nginx:alpine web-server
  ```

  删除service

  ```
  docker service rm web-server
  ```

  ` docker ps -a`就空了，但是，`docker node ls`还是可以看到node都还是在的，





