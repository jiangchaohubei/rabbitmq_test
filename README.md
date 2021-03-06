# docker安装
- mac:
```
$ brew cask install docker
```
- ubuntu:
```
$ sudo apt-get update
$ sudo apt-get install docker.io
```
# 配置镜像加速
- mac:
- 点击mac右上角菜单栏docker鲸鱼图标 -> Preferences -> Daemon -> 两个都添加 https://registry.docker-cn.com
- ubuntu:
- 编辑 vi /etc/docker/daemon.json，没有就创建一个：
```
{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
```

# 拉取rabbitmq带web管理界面的镜像
```
$ docker pull rabbitmq:management
$ docker images
```

# 创建映射文件夹并share给docker
- 创建映射文件夹/data/rabbitmq-data
- 点击mac右上角菜单栏docker鲸鱼图标 -> Preferences -> File sharing -> 添加/data
  

# 创建容器运行
```
$ docker run -d --name rabbitmq_web  --publish 5671:5671 --publish 5672:5672 --publish 4369:4369 --publish 25672:25672 --publish 15671:15671 --publish 15672:15672 -v /data/rabbitmq-data/:/var/rabbitmq/lib rabbitmq:management
```
- 访问http://localhost:15672   guest:guest

# 测试5种策略模式
- pull本项目后执行 npm install
- 终端通过node 执行相关发布者或接收者js文件，通过-f 指定运行不同模式的方法

# 简单模式
- <img src="http://5b0988e595225.cdn.sohucs.com/images/20170824/199a85de82bd444cad58e0204f700a54.png" alt="woke" >
- 消息发布到队列，接受者监听该队列后，该队列将一直处于监听状态，除非手动关闭，自动接收消息
- 同时启动两个终端：
- 发布者startPub.js：
```
$ node startPub.js -f sendMsg_work
$ SendMsg_work发布消息：1
$ SendMsg_work发布消息：2
$ SendMsg_work发布消息：3
$ SendMsg_work发布消息：4
```
- 接收者startRec1.js：
```
$ node startRec1.js -f getMsg_work
$ getMsg_work1接收消息：1
$ getMsg_work1接收消息：2
$ getMsg_work1接收消息：3
$ getMsg_work1接收消息：4
```

# 工作队列模式
- <img src="http://5b0988e595225.cdn.sohucs.com/images/20170824/f081b7b5a6d24c9b8097ae5d5ad5da6a.png" alt="woke" >
- 发布一条消息，只有一个receiver接收到消息，发布两条，分别接收到一条消息
- 多个消费者时交替执行队列中任务，每个消费者执行任务多少取决于其消费能力，一个任务只会被执行一次
- 可尝试多次发送消息，查看两个消费者交替执行任务,可在消费者内加入延时函数模拟消费能力不同
- 简单模式与工作队列模式都是生产者直接将消息推送到队列中，此时队列已经创建，因此后创建的消费者监听该队列时会收到以往该队列中所有(未被处理)的消息
- 同时启动三个终端：
- 发布者startPub.js：
```
$ node startPub.js -f sendMsg_work
$ SendMsg_work发布消息：1
$ SendMsg_work发布消息：2
$ SendMsg_work发布消息：3
$ SendMsg_work发布消息：4
$ SendMsg_work发布消息：5
$ SendMsg_work发布消息：6
$ SendMsg_work发布消息：7
$ SendMsg_work发布消息：8
```
- 接收者startRec1.js：
```
$ node startRec1.js -f getMsg_work
$ getMsg_work1接收消息：1
$ getMsg_work1接收消息：3
$ getMsg_work1接收消息：5
$ getMsg_work1接收消息：7
```
- 接收者startRec2.js：
```
$ node startRec2.js -f getMsg_work
$ getMsg_work2接收消息：2
$ getMsg_work2接收消息：4
$ getMsg_work2接收消息：6
$ getMsg_work2接收消息：8
```
# 发布订阅模式
- <img src="http://5b0988e595225.cdn.sohucs.com/images/20170824/28caa49d28f648568aff1983a06e7876.png" alt="woke" >
- 发布一条消息，两个receiver同时接收到消息(只要各自队列绑定到同一个交换机，就都能接收到消息）
- 发布者先把消息推送到交换机（exchange）中,当有队列与该交换机绑定时，再将消息推送到该队列中；
- 因此该模式只有订阅（即绑定队列和交换机）后才能收到消息，订阅之前的消息都不会收到
- 同时启动三个终端：
- 发布者startPub.js：
```
$ node startPub.js -f sendMsg_pubSub
$ SendMsg_pubSub发布消息：1
$ SendMsg_pubSub发布消息：2
$ SendMsg_pubSub发布消息：3
$ SendMsg_pubSub发布消息：4

```
- 接收者startRec1.js：
```
$ node startRec1.js -f getMsg_pubSub
$ getMsg_pubSub1接收消息：1
$ getMsg_pubSub1接收消息：2
$ getMsg_pubSub1接收消息：3
$ getMsg_pubSub1接收消息：4
```
- 接收者startRec2.js：
```
$ node startRec2.js -f getMsg_pubSub
$ getMsg_pubSub2接收消息：1
$ getMsg_pubSub2接收消息：2
$ getMsg_pubSub2接收消息：3
$ getMsg_pubSub2接收消息：4
```

# 路由模式
- <img src="http://5b0988e595225.cdn.sohucs.com/images/20170824/440a53ec8ef645fabfbb7eef39866284.png" alt="woke" >
- 发布消息，路由绑定为 "rout"  ,只有startRec1能接收到消息，尝试修改receiver2的getMsg_routing中的绑定路由为发布路由"rout",
- 再次启动startRec2调用getMsg_routing方法，发现都能接收到任务消息
- 路由需要完全匹配
- 同时启动三个终端：
- 发布者startPub.js：
```
$ node startPub.js -f sendMsg_routing
$ SendMsg_routing发布消息：1
$ SendMsg_routing发布消息：2
$ SendMsg_routing发布消息：3
$ SendMsg_routing发布消息：4

```
- 接收者startRec1.js：
```
$ node startRec1.js -f getMsg_routing
$ getMsg_routing1接收消息：1
$ getMsg_routing1接收消息：2
$ getMsg_routing1接收消息：3
$ getMsg_routing1接收消息：4
```
- 接收者startRec2.js：
```
$ node startRec2.js -f getMsg_routing

```

# 通配符模式
- <img src="http://5b0988e595225.cdn.sohucs.com/images/20170824/9c2ae9d3e84d4c6dbf6200e4c18f9f96.png" alt="woke" >
- 同路由模式，只是路由不是完全匹配，而是根据通配符匹配，路由由 "." 分隔，"*"匹配零到一个单词，"#"匹配零到多个单词，
- 调用一次接口，代码中已发布三条消息，分别为三个路由: abb.b.fg    abb.c.df   abb.d.bg
- startRec1 的通配符路由为："abb.#"  ，因此能接收到所有以 abb开头的路由 ，能接收3条消息
- startRec2 的通配符路由为："*.b.#"  ，因此能接收到所有以 b为中间单词的路由 ，能接收1条消息
- 可尝试自己修改通配符路由，熟悉匹配规则
- 同时启动三个终端：
- 发布者startPub.js：
```
$ node startPub.js -f sendMsg_topic
$ SendMsg_topic发布消息：1
$ SendMsg_topic发布消息：2
$ SendMsg_topic发布消息：3
$ SendMsg_topic发布消息：4

```
- 接收者startRec1.js：
```
$ node startRec1.js -f getMsg_topic
$ getMsg_topic1接收消息：1
$ getMsg_topic1接收消息：1
$ getMsg_topic1接收消息：1
$ getMsg_topic1接收消息：2
$ getMsg_topic1接收消息：2
$ getMsg_topic1接收消息：2
$ getMsg_topic1接收消息：3
$ getMsg_topic1接收消息：3
$ getMsg_topic1接收消息：3
$ getMsg_topic1接收消息：4
$ getMsg_topic1接收消息：4
$ getMsg_topic1接收消息：4
```
- 接收者startRec2.js：
```
$ node startRec2.js -f getMsg_topic
$ getMsg_topic2接收消息：1
$ getMsg_topic2接收消息：2
$ getMsg_topic2接收消息：3
$ getMsg_topic2接收消息：4

```

# 相关网址
- rabbitmq最简单全面指南：http://www.sohu.com/a/166950443_411876
- amqplib API文档：http://www.squaremobius.net/amqp.node/channel_api.html#channel_sendToQueue
- 消息队列的使用场景： https://www.zhihu.com/question/34243607
