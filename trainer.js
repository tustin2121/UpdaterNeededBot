// trainer.js
// Trainer for the natural language classifier

const natural = require("natural");
const classifier = new natural.BayesClassifier();

(function(){
	const CLASSID = "memory";
	
	classifier.addDocument("set the e4 runs to four", CLASSID);
})();

(function(){
	const CLASSID = "location";
	
	classifier.addDocument("where are we", CLASSID);
	classifier.addDocument("whats going on", CLASSID);
})();
