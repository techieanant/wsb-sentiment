require('dotenv').config();
const schedule = require('node-schedule');
const Twitter = require("twitter-lite");
// Use python shell
const { PythonShell } = require('python-shell');

const x = setInterval(runScript, 3 * 1000 * 60 * 60);


let API_KEY = process.env.API_KEY;
let API_KEY_SECRET = process.env.API_KEY_SECRET;

let ACCESS_TOKEN = process.env.ACCESS_TOKEN;
let ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;


const client = new Twitter({
  subdomain: "api", 
  version: "1.1", 
  consumer_key: API_KEY,  
  consumer_secret: API_KEY_SECRET,  
  access_token_key: ACCESS_TOKEN,  
  access_token_secret: ACCESS_TOKEN_SECRET  
});

async function tweetThread(thread) {
  let lastTweetID = "";
  for (const status of thread) {
    const tweet = await client.post("statuses/update", {
      status: status,
      in_reply_to_status_id: lastTweetID,
      auto_populate_reply_metadata: true
    });
    lastTweetID = tweet.id_str;
  }
}


function runScript(){
	var myPythonScriptPath = 'wsb-sentiment.py';
	var pyshell = new PythonShell(myPythonScriptPath);

	console.log("Running Sentiment Analysis");
	let finalMessage = "";

	pyshell.on('message', function (message) {		
		finalMessage = finalMessage + "\n" + message;	
	});

	// end the input stream and allow the process to exit
	pyshell.end(function (err) {
		if (err){
			throw err;
		};
		
		const mess = finalMessage.split("\n\n");
		
		const thread = [];
		thread.push(mess[1]);
		thread.push(mess[2]);

		tweetThread(thread).catch(console.error);		
		console.log('Finished');
	});
}








