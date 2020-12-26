# CheckMem
A simple script to check changing in processmemory  

## Usage
```javascript
const checkMem = require("checkMem");
//setting up amount of memory to check and time interval for running
checkMem.set(<size:String>, <time interval:Number in milisecond>)
/*eg: checkMem("2mb", 1000);
acceptable input type of : number(m|mb|k|kb|others: default is byte)*/
//start monitoring
checkMem.start() //return Timeout object
//stop monitoring
chekMem.stop()
```

cli output example
```bashshell
14.014s from last log
{
  rss: '1429.7  MB',
  heapTotal: '227.1  MB',
  heapUsed: '167.934  MB',
  external: '152.2  MB',
  arrayBuffers: '100.6  MB'
}
```