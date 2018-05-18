require('babel-register');
const amqp = require("amqplib")
const program = require('commander');
program
    .option('-f, --func <func>', '[optional] function for request duration')
    .parse(process.argv);

const amqpUrl="amqp://localhost:5672"
let connection ;


/**  简单模式与工作队列模式(取决于连接这个队列的消费者数量)
 *   多个消费者时交替执行队列中任务，每个消费者执行任务多少取决于其消费能力
 *   一个任务只会执行一次
 */
const getMsg_work= async ()=>{
    console.log("【简单模式与工作队列模式】监听workQueue队列，接收其中未被处理的消息，与startRec1平分任务")
    const queue="workQueue"
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    await channel.consume(queue, function(message) {
        console.log(`getMsg_work2接收消息：${message.content.toString()}`);
        channel.ack(message);
    });

}

/**发布订阅模式（publish&subscribe）
 * 一个任务可被多个消费者（订阅者）同时接收
 * 发布者通过管道（channel）把任务发布到交换机（exchange）,消费者创建各自的队列并绑定到该交换机是为订阅
 * exchange的类型fanout,路由（routingKey）为""就行
 */
const getMsg_pubSub= async ()=>{
    console.log("【发布订阅模式】绑定pubSubQueue2队列与交换机pubSubExchange，并监听该队列，能接订阅后收未处理的消息，与startRec1同步接收消息")
    const queue="pubSubQueue2"
    const ex="pubSubExchange"

    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    await channel.bindQueue(queue,ex)
    await channel.consume(queue, function(message) {
        console.log(`getMsg_pubSub2接收消息：${message.content.toString()}`);

        channel.ack(message);
    });
}

/**路由模式（routing）
 * 通过路由发布的消息只能被绑定同样路由的队列接收
 * 通发布订阅模式，只是在发布消息到交换机时需要指定路由（routingKey）,消费者把队列绑定到交换机时也指定相同路由
 * exchange的类型direct
 */
const getMsg_routing= async ()=>{
    console.log('【路由模式】绑定routingQueue2队列与交换机routingExchange，绑定路由""不匹配推送路由rout，不能接收消息')
    const queue="routingQueue2"
    const ex="routingExchange"

    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    await channel.bindQueue(queue,ex,"")
    await channel.consume(queue, function(message) {
        console.log(`getMsg_routing2接收消息：${message.content.toString()}`);

        channel.ack(message);
    });
}

/**通配符模式（topic）
 * 同路由模式，只是路由为通配符匹配，路由由 "." 分隔，"*"匹配零到一个单词，"#"匹配零到多个单词
 * 通配符"* #"是用在消费者绑定队列与交换机的时候
 * exchange的类型topic
 */
const getMsg_topic= async ()=>{
    console.log("【通配符模式】绑定topicQueue2队列与交换机topicExchange，绑定路由*.b.#,能匹配以b在中间，前面一个单词后面n个单词的所有路由，此处一次能接收1条消息")
    const queue="topicQueue2"
    const ex="topicExchange"

    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    await channel.bindQueue(queue,ex,"*.b.#")
    await channel.consume(queue, function(message) {
        console.log(`getMsg_topic2接收消息：${message.content.toString()}`);
        channel.ack(message);
    });
}

(async ()=>{
    if(!connection){
        connection=await amqp.connect(amqpUrl)
    }

    await eval(`${program.func}()`)

})()



