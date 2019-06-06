const 
  express = require('express')
  app = require('express')(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  rtsp = require('rtsp-ffmpeg');
  
  kafka = require('kafka-node'),
  client1 = new kafka.KafkaClient({kafkaHost: '192.168.0.217:9092'}),
  client2 = new kafka.KafkaClient({kafkaHost: '192.168.0.217:9092'}),

  offset1 = new kafka.Offset(client1);
  offset2 = new kafka.Offset(client2);
  Consumer = kafka.Consumer

  var list1 =[]
  var list2 =[]

  var obj = {}

  offset1.fetch([
      { topic: 'sign_exception', partition: 0, time: Date.now(), maxNum: 1 }
  ], function (err, data) {
      // data
      console.log(data)
      // { 't': { '0': [999] } }
      consumer = new Consumer(
          client1,
          [
              { topic: 'sign_exception', partition: 0,offset: data.sign_exception['0']+1, },
          ],
          {
              autoCommit: false,
              fromOffset: true,
          }
      );
     
      consumer.on('message', function (message) {
          // var topic = message.topic
          // var image = JSON.parse(message.value).image
          // var employeeName = JSON.parse(message.value).employeeName
          // var identTime = JSON.parse(message.value).identTime

          // obj.topic = topic
          // obj.image = image
          // obj.employeeName = employeeName
          // obj.identTime = identTime
          console.log(JSON.parse(message.value).employeeName)          
          console.log(message.offset)
          list1.push(message)
      });
      consumer.on('error', function (err) {
        console.log(err)
      })
      
  });

  offset2.fetch([
    { topic: 'frontendData', partition: 0, time: Date.now(), maxNum: 1 }
], function (err, data) {
    // data
    console.log(data)
    // { 't': { '0': [999] } }
    consumer = new Consumer(
        client2,
        [
            { topic: 'frontendData', partition: 0,offset: data.frontendData['0']+1,}
        ],
        {
            autoCommit: true,
            fromOffset: true,
        }
    );
   
    consumer.on('message', function (message) {
        // var topic = message.topic
        // var image = JSON.parse(message.value).image
        // var employeeName = JSON.parse(message.value).employeeName
        // var identTime = JSON.parse(message.value).identTime

        // obj.topic = topic
        // obj.image = image
        // obj.employeeName = employeeName
        // obj.identTime = identTime
        // console.log(message)
        list2.push(message)
    });
    consumer.on('error', function (err) {
      console.log(err)
    })
    
});
 
  app.get("/news1",function(req,res){
    res.send(list1);
  })
  app.get("/news2",function(req,res){
    res.send(list2);
  })
  app.use(express.static(__dirname));
  server.listen(6147, function(){
    console.log('Listening on localhost:6147');
  });
  
// var uri = 'rtsp://192.168.0.47:8554/ds-test',
//   stream = new rtsp.FFMpeg({input: uri});
// io.on('connection', function(socket) {
//   var pipeStream = function(data) {
//     socket.emit('data', data.toString('base64'));
//   };
//   stream.on('data', pipeStream);
//   socket.on('disconnect', function() {
//     stream.removeListener('data', pipeStream);
//   });
// });


app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});



  