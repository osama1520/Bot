const wa = require('@open-wa/wa-automate');
var mysql = require('mysql2');
const axios = require('axios');
const config = require('./config');
var con = mysql.createConnection(config);

var cron = require('node-cron');

wa.create({
  sessionId: "COVID_HELPER",
  multiDevice: true, //required to enable multiDevice support
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: 'PT_BR',
  logConsole: false,
  popup: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));

function start(client) {
  	
  cron.schedule('* * * * *', async ()=>{
    async function main(prayer){
      const data = await axios('http://192.168.100.100:3000/'+prayer).then(res =>res.data)
      const date = new Date();
      var today = (date.getMonth()+1) +"/"+date.getDate()+"/"+date.getFullYear()
      
      data.forEach(element => {
        if (element['Start Date'] == today){
          prayerTime = element['Start Time']
          //prayerTime = prayerTime.substring(0, prayerTime.length-3);
          const today = new Date();
          var mins = '';
          var hours = '';
          if(today.getMinutes()< 10){
            mins = ":0" + today.getMinutes()
          }else{
            mins =":" + today.getMinutes() 
          }
          if(today.getHours()< 10){
            var hours = '0'+today.getHours() 
          }else{
            var hours = today.getHours() 
          }
          var time = hours + mins + ":00"
          time = tConvert(time);
          function getarray() {
            return new Promise(function(resolve, reject) {
              con.connect(function(err) {
              var sql = `select * from user`;
              var array = []
              con.query(sql, function (err, result, fields) {
                if (err) {
                reject(err);
                } else {
                var data = JSON.parse(JSON.stringify(result));
                for (var i = 0; i < data.length; i++) {
                  array.push(data[i].phoneid)
                }
                resolve(array);
                }
              });
              });
            });
            }
          getarray()
          .then(function(array) {
            //console.log(array);
            if (prayerTime == time){
            if (array.length != 0){
              array.forEach(element => {
                client.sendText(element,'🔔 '+prayer+ ' Time 🔔')	
              });
            }
          }
          })
          .catch(function(error) {
            console.log(error);
          });

          //prayerTime = tConvert(prayerTime);
          
          //console.log(prayerTime +" "+ time)
          //console.log("Prayer Time: "+prayerTime+" Current Time "+time)
        }
      });
    
      //console.log(output);
    }
    const prayerList = ['Fajr','Dhuhr','Asr','Maghrib','Isha']
    const timer = ms => new Promise(res => setTimeout(res, ms))
    async function load () { // We need to wrap the loop into an async function for this to work
      for (let i = 0; i < 5; i++) {
        main(prayerList[i]);
        await timer(2000);
      }
      }

    load();
    //console.log('Working! ' + arrayOfContacts);
    function tConvert(time) {
      // Check correct time format and split into components
      time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
      
      if (time.length > 1) { // If time format correct
        time = time.slice(1);  // Remove full string match value
        time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join (''); // return adjusted time or original string
    }
    //console.log(arrayOfContacts)
  })

    function updatePhoneId(phone) {
      con.connect(function(err) {
      var tes = phone;
      var sql = `INSERT INTO user (phoneid) VALUES (?);`;
      checkIfExists(tes, function(err, exists) {
        if (err) {
        console.log(err);
        return;
        }
        if (exists) {
        const values = [tes];
        con.query(sql,values, function (err, result, fields) {
          if (err){
          console.log(result);
          } else {
          console.log("New Record Added")
          var data = JSON.parse(JSON.stringify(result))
          console.log(data);
      
          }
        });
        }else{console.log("Cannot add duplicate record");
      
      }
      });
      });
    }

    function checkIfExists(phone, callback){
      con.connect(function(err) {
      var tes = phone;
      var sql = `select * from user`;
      const values = [tes];
      con.query(sql,values, function (err, result, fields) {
        if (err){
        console.log(result);
        callback(err);
        } else {
        var data = JSON.parse(JSON.stringify(result));
        var exists = false;
        for (var i = 0; i < data.length; i++) {
          if (data[i].phoneid === phone) {
          exists = true;
          break;
          }
        }
        console.log(!exists);
        callback(null, !exists);
        }
      });
      });
    }

    const prayerList = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
    async function getPrayersTimeList() {
      const list = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const timings = [];
      const date = new Date();
      const today = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
      
      for (let i = 0; i < 5; i++) {
        const data = await axios(`http://192.168.100.100:3000/${list[i]}`).then(res => res.data);
        for (const element of data) {
        if (element['Start Date'] === today) {
          const prayerTime = element['Start Time'];
          let timeComponents = prayerTime.split(":");
          let hour = timeComponents[0];
          let minute = timeComponents[1];
          let newTimeString = hour + ":" + minute + ' ' + prayerTime.slice(-2);
          timings.push(newTimeString);
         // await new Promise(resolve => setTimeout(resolve, 200));
          // Add a delay of 2 seconds
          
        }
        }
      };
      
      return timings;
    }
    const array = []
    async function getGamesList(){
      var string = '';
      for (let i = 1; i < 30; i++) 
      {
        try {
          const data = await axios(`http://192.168.100.100:4000/match${i}`).then(res => res.data);
          if (data.team1 === 'Pakistan'|| data.team2 === 'Paksitan'){
            var t = parseInt(data.time.slice(0,2))
            var newtime = parseInt(t+2)+ data.time.substr(2);
            string += data.team1  + ' vs ' + data.team2 + '\n' + 'Date: ' + data.date + ' \n' +data.match + '\nVenue: ' + data.venue + '\nTime: ' + tConvert(newtime+":00") +'\n⎯⎯⎯⎯⎯⎯ ˳༄꠶ ⎯⎯⎯⎯⎯⎯\n'
          }
          // use the data here
          } catch (error) {
          console.error(error);
          // handle the error here
          }

      }
      array.push(string)
      return array
    }

    // reminder code
    function addReminder(array) {
      con.connect(function(err) {
      time = array[2].split(' ')
      const timeWithAM = time[1] + " " + time[2]; // combine time and "AM"
      const list = [time[0], timeWithAM]; // create a new list with date and time with "AM"
      console.log(array)
      const newTime = convertTime12to24(list[1])
      array[2] = list[0] + ' ' + newTime
        var sql = `INSERT INTO reminder (phoneno,description,datetime) VALUES (?);`;
      
          const values = [array];
          con.query(sql,values, function (err, result, fields) {
          if (err){
            client.sendText(array[0],'Syntax error')
              console.log(err);
          } else {
            console.log("New Record Added!!")
            client.sendText(array[0],'Reminder set sucessfully✅')
            var data = JSON.parse(JSON.stringify(result))
            console.log(data);
          }
          });
        }
      )}

      function sendReminder(){

        getarray()
        .then(function(array) {
        var array = array
      
          array.forEach(element => {
          const currentDate = new Date()
          const currentDayOfMonth = currentDate.getDate();
          const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
          const currentYear = currentDate.getFullYear();
      
          var mins = '';
          var hours = '';
          if(currentDate.getMinutes()< 10){
            mins = ":0" + currentDate.getMinutes()
          }else{
            mins =":" + currentDate.getMinutes() 
          }
          if(currentDate.getHours()< 10){
            var hours = '0'+currentDate.getHours() 
          }else{
            var hours = currentDate.getHours() 
          }
          var time = hours + mins
          const currentDateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
          const target = element.datetime.split(' ')
          console.log('Target Date :',target[0],'\nTarget Time:',target[1], '\nCurrent Time:',time,'\n\n')
          if(target[0] ==currentDateString &&time == target[1]){
            client.sendText(element.phoneno,'🚨*Reminder*🚨\n' + element.description)

          }
          });
        })
      }
      
      cron.schedule('* * * * *', () => {
        sendReminder();
        });

        
    function getarray() {
      return new Promise(function(resolve, reject) {
      con.connect(function(err) {
      var sql = `select * from reminder`;
      var array = []
      con.query(sql, function (err, result, fields) {
        if (err) {
        reject(err);
        } else {
        var data = JSON.parse(JSON.stringify(result));
        for (var i = 0; i < data.length; i++) {
        array.push(data[i])
        }
        resolve(array);
        }
      });
      });
      });
    }
    const convertTime12to24 = (time12h) => {
      const [time, modifier] = time12h.split(' ');
      
      let [hours, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }
      
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }
      
      return `${hours}:${minutes}`;
      }

    //   cron schedules
    cron.schedule('0 13 * * *',  ()=>{
      client.sendText('97477623608@c.us','🚨*Reminder*🚨\nTake Aripiprazole')
       })
    cron.schedule('0 22 * * *',  ()=>{
      client.sendText('97477623608@c.us','🚨*Reminder*🚨\nTake Olanzapine')
    })
    cron.schedule('15 21 * * sat,mon,thu',  ()=>{
      client.sendText('97477623608@c.us','🚨*Reminder*🚨\nApply Oil')
    })
    client.onIncomingCall(async call=>{
      console.log('Calling!')
      await client.sendText(call.peerJid._serialized, 'Sorry I cannot accept calls');
  });
  client.onMessage(async message => {
    if (message.body === 'Hi') {
      await client.sendText(message.from, '👋 Hello!');
    }
    console.log(message.from)

    //console.log(message.from)
    if(message.body === '!ping') {
      await client.sendText(message.from, 'pong');
    }else if(message.body ==='!joke'){
      const joke = await axios('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,racist,sexist,explicit').then(res =>res.data)
      const jokeMessage = await client.sendText(message.from,joke.setup || joke.joke)

      if(joke.delivery) setTimeout(function(){client.sendText(message.from,joke.delivery)},5000)
    }
    else if(message.body === '!meme'){
      const meme = await axios('https://api.memegen.link/templates').then(res =>res.data)
      const random = Math.floor(Math.random() * 101);
      const data = meme[random].example.url;
      //client1.sendMessage(message.from, await MessageMedia.fromUrl(meme[random].example.url))
     
      await client.sendText(message.from, data);
    }
    else if(message.body ==='!weather'){
      const weather = await axios('http://api.weatherapi.com/v1/current.json?key=ee42a59c745946199a2173755231203&q=doha&aqi=no').then(res =>res.data)
     
      await client.sendText(message.from, 'The condition is '+weather.current.condition.text +'.\nThe current weather is '+ weather.current.temp_c + " degrees");
    }
    else if(message.body ==='!quote'){
      const quote = await axios('https://zenquotes.io/api/random').then(res =>res.data)	
      await client.sendText(message.from,quote[0].q + " by " + quote[0].a)
      
    }
    else if(message.body ==='!prayer-times'){
      (async () => {
        var timings = await getPrayersTimeList();
        var output = ''
        var count = 0;
        timings.forEach(element => {
          output += '☽︎  ' +prayerList[count]+' '+element + '\n';
          count +=1;
        });
       
        await client.sendText(message.from,output)
        })();
            
      }else if(message.body ==='!prayer-subscribe'){
        updatePhoneId(message.from);
        await client.sendText(message.from,"Subscribed✅")
        //console.log(arrayOfContacts)
      }else if(message.body ==='!info'){

        await client.sendText(message.from,`Hi there! Thank you for reaching out to our bot! Our bot is designed to provide you with a range of helpful features. Some features that you can use are:\n\n➡️ !prayer-subscribe - alerts you whenever it's time for a specific prayer \n➡️ !prayer-times - tells you the time each prayer is called at\n➡️ !quote - gives you randomly generated quotes\n➡️ !weather - tells you the weather\n\nWe hope you enjoy our bot 😊`)
      }else if(message.body ==='!pak-games'){
        (async () => {var array = await getGamesList();
         
          await client.sendText(message.from,(array[0]))
         })();				
      }else if(message.body.includes('!reminder')){
        var messages = message.body;
        var splitted =messages.split('/')
        console.log(splitted.length)
        if((splitted.length ==4)&& (splitted[1] != '') && (splitted[2] + splitted[3] != '') && (splitted[2].split('-').length ==3)){
          addReminder([message.from,splitted[1], (splitted[2] + splitted[3])])
        }else{
          await client.sendText(message.from,'❌Fields incomplete/invalid, Please refer to the correct syntax below\n\n*!reminder/Go for a walk/24-4-2023/ 11:25 PM*')
        }
      }
  });
}