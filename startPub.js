require('babel-register');
const amqp = require("amqplib")
const program = require('commander');
program
    .option('-f, --func <func>', '[optional] function for request duration')
    .parse(process.argv);

const amqpUrl="amqp://localhost:5672"
let count=0


/**  简单模式与工作队列模式(取决于连接这个队列的消费者数量)
 *   多个消费者时交替执行队列中任务，每个消费者执行任务多少取决于其消费能力
 *   一个任务只会执行一次
 */
const sendMsg_work= async ()=>{

    const queue="workQueue";
    const message=++count
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    await channel.sendToQueue(queue, new Buffer(`${message}`), {
        // RabbitMQ关闭时，消息会被保存到磁盘
        persistent: true
    });
    await channel.close();
    //await connection.close();

    console.log(`SendMsg_work发布消息：${message}`)
}

/**发布订阅模式（publish&subscribe）
 * 一个任务可被多个消费者（订阅者）同时接收
 * 发布者通过管道（channel）把任务发布到交换机（exchange）,消费者创建各自的队列并绑定到该交换机是为订阅
 * exchange的类型fanout,路由（routingKey）为""就行
 */
const sendMsg_pubSub= async ()=>{

    const ex="pubSubExchange"
    const message=++count
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();
    await channel.assertExchange(ex,"fanout")
    await channel.publish(ex,"",new Buffer(`${message}`))
    await channel.close();
    //await connection.close();

    console.log(`sendMsg_pubSub发布消息：${message}`)
}

/**路由模式（routing）
 * 通过路由发布的消息只能被绑定同样路由的队列接收
 * 通发布订阅模式，只是在发布消息到交换机时需要指定路由（routingKey）,消费者把队列绑定到交换机时也指定相同路由
 * exchange的类型direct
 */
const sendMsg_routing= async ()=>{

    const ex="routingExchange"
    const message=++count
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();
    await channel.assertExchange(ex,"direct")
    await channel.publish(ex,"rout",new Buffer(`${message}`))
    await channel.close();
    //await connection.close();

    console.log(`sendMsg_routing发布消息：${message}`)
}

/**通配符模式（topic）
 * 同路由模式，只是路由为通配符匹配，路由由 "." 分隔，"*"匹配零到一个单词，"#"匹配零到多个单词
 * 通配符"* #"是用在消费者绑定队列与交换机的时候
 * exchange的类型topic
 */
const sendMsg_topic= async ()=>{

    const ex="topicExchange"
    const message=++count
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();
    await channel.assertExchange(ex,"topic")
    await channel.publish(ex,"abb.b.fg",new Buffer(`${message}`))
    await channel.publish(ex,"abb.c.df",new Buffer(`${message}`))
    await channel.publish(ex,"abb.d.bg",new Buffer(`${message}`))
    await channel.close();
    //await connection.close();

    console.log(`sendMsg_topic发布消息：${message}`)
}



(()=>{
    setInterval(async function(){

            await eval(`${program.func}()`)

    },2000);
})();


