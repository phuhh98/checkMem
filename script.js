const deep = require("deep_clonee");
//const EventEmitter = require("event"); //event and fs are use for saving log file at the running place
//const fs = require("fs");
//let gotLog = new EventEmitter();

let memLog = {};
let clock = null;
let started = false;
let diffSize, interval;	//variable for input values
let sizePattern = /(\d*)?(m|mb|k|kb|b|byte|.*?)?/i; //search pattern for input size

//check input size and return a number of size in byte
let checkSize = function checkSize(size) {
    //input size is a string
	let match = size.trim(" ").match(sizePattern);
	let [sizeInByte, unit] = [parseInt(match[1]), match[2]];
    if (!sizeInByte) {
        throw new Error("INVALID input size")
    }
	unit? unit = unit.toLowerCase() : unit = null;
    switch (unit) {
        case "k":
            sizeInByte = sizeInByte*1024;
			break;
		case "kb":
			sizeInByte = sizeInByte*1024;
			break;		
        case "m":
            sizeInByte = sizeInByte*1024**2;
			break;
		case "mb":
			sizeInByte = sizeInByte*1024**2;
			break;
        default:
            sizeInByte = parseInt(sizeInByte);
            break;
    }
    return sizeInByte;
}


// calculate, print memory log in a readable style, return memLog{} container object with memLog key
function processMem(memLog) {
	for (let item in memLog) {
		let sizeInByte = memLog[item];
		if ( sizeInByte < 1024) {
			memLog[item] = sizeInByte + "  BYTE";
			continue;
		} else if ( sizeInByte < 1024**2) {
			memLog[item] = sizeInByte/1024 + "  KB";
			continue;
		} else if ( sizeInByte < 1024**3) {
			memLog[item] = sizeInByte/1024**2 + "  MB";
			continue;
		} else {
			memLog[item] = sizeInByte/1024**3 + "  GB";
			continue;
		}
	}
	console.log(memLog);
	return {memLog: memLog};
}


//check for change in memory and return logData{} object with time and memLog keys
function checkDiff() {
	let newMemLog = process.memoryUsage();
	var logData = {};
	if (!Object.keys(memLog).length || started == false) {
		started = true;
		clock = new Date;
		memLog = deep.obj(newMemLog);
		return;
	}
	let printOut = false;
	for (let item in newMemLog) {
		let diff = Math.abs(newMemLog[item] - memLog[item]);
		if (diff >= diffSize) {
			printOut = true;
		}
	}
	if (printOut) {
		let newClock = new Date();
		let clockDiff = (newClock - clock)/1000 + "s";
		clock = newClock;
		console.log("-".repeat(50));
		console.log(`${clockDiff} from last log`);
		memLog = deep.obj(newMemLog);
		logData = deep.obj(processMem(newMemLog));
		logData.time = clock;
	}
	return logData;
}

//initialize exporting object
const checkMem = {};

//interval id saver
checkMem[Symbol.for("intervalId")] = null;

//set diffsize and time interval, default with 5 MB and 1000 milisecond
checkMem.set = function setArguments(size = "5mb", time = 1000) {
	diffSize = checkSize(size);
	interval = parseInt(time);
}

// start checking memory change
checkMem.start = function start() {
	this[Symbol.for("intervalId")] = setInterval(function() {
		let logData = checkDiff();
		//gotLog.emit("newLog");
		return logData;
	}, interval);
	return this[Symbol.for("intervalId")];
}.bind(checkMem);


//stop checking memory change and reset to initial state
checkMem.stop = function stop() {
	clearInterval(this[Symbol.for("intervalId")]);
	started = false;
	this[Symbol.for("intervalId")] = null;
	memLog = {};
	clock = null;
}.bind(checkMem);

module.exports = checkMem;
