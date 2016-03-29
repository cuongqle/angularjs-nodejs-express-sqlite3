# angularjs-nodejs-express-sqlite3
A small Auction game using [Angularjs+bootstrap3] to build frontend and [Nodejs+Express+Socket.io+sqllite3] to build backend which using Socket.io for real-time communication between clients

1- Description:

This is a small game that using Angularjs+bootstrap3 to built-up a simple front-end to connect a simplier server which using 
Nodejs+Express+Socket.io+sqllite3 that can response real-time.  

2- How to run:

I/ Start server: navigate to backend and start server by node command:
node auctionserver.js
Open http://127.0.0.1:9081 to see server is working or not?

II/ Deploy frontend in IIS is much simpler if you have experienced with IIS, or just following these steps if this is the first 
time for you:
http://www.codeproject.com/Articles/280137/How-To-Deploy-a-Web-App-in-IIS

PS:
In auction.js, there is a place to configure host url, by default, our server will be hosted under 127.0.0.1 address and listening port 9081,
please be aware that if you change these information, please also change it in auction.js file at this place of code:

var AuctionDefaultValues = 
{
	locale: window.navigator.userLanguage || window.navigator.language,	
	host: 'http://127.0.0.1:9081'
};

You can refer Document.docx for more detail.

Just download code and enjoy it.





