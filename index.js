const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");

const inputFile = 'inputFile.csv';
const data = [];

const convertTime = timeStr => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
       hours = '00';
    }
    if (modifier === 'PM') {
       hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
 };

function hoursBetween(startTime, endTime) {
    const start = moment(startTime, 'HH:mm');
    // console.log(start);
    const end = moment(endTime, 'HH:mm');
    // console.log(end);
    return end.diff(start, 'hours', true);
}

fs.createReadStream(inputFile).pipe(csv()).on('data', (row) => {
    data.push(row);
}).on('end', () => {
    // data.sort((a, b) => a['Employee Name'].localeCompare(b['Employee Name']));
    // console.log(data);

    // console.log('hello')
    let consecutiveDays = 1;
    let prevEmployee = data[0]["Employee Name"];
    let prevEndTime = convertTime(new Date(data[0]['Time Out']).toTimeString());
    // console.log(prevEndTime);

    for (let i = 1; i < data.length; i++) {
        // console.log('hello')

        const currentEmployee = data[i]['Employee Name'];
        const currentStartTime = convertTime(new Date(data[i]['Time']).toTimeString());
        // console.log(currentStartTime);
        const currentEndTime = convertTime(new Date(data[i]['Time Out']).toTimeString());
        // console.log(currentEmployee);
        if (currentEmployee === prevEmployee) {
            // console.log(currentEmployee+" "+prevEmployee);

            const timeBetweenShifts = hoursBetween(prevEndTime, currentStartTime);
            // console.log(timeBetweenShifts)
            if (timeBetweenShifts < 10 && timeBetweenShifts > 1) {
                
                console.log(`Employee: ${currentEmployee}, Position: ${data[i]["Position Status"]} - has less than 10 hours between shifts but greater than 1.`)
            }

            if (
                currentEmployee === prevEmployee &&
                moment(currentStartTime, 'HH:mm').diff(moment(prevEndTime, 'HH:mm'), 'days') === 1
            ) {
                consecutiveDays++;
                if (consecutiveDays === 7) {
                   
                    console.log(`Employee: ${currentEmployee}, Position: ${data[i]["Position Status"]} - Worked for 7 consecutive days`)
                    consecutiveDays = 1;
                }
            } else {
                consecutiveDays = 1;
            }
        } else {
            consecutiveDays = 1;
        }

        const shiftDuration = hoursBetween(currentStartTime, currentEndTime);
        if (shiftDuration > 14) {
            
            console.log(`Employee: ${currentEmployee}, Position: ${data[i]['Position Status']} - Worked more than 14 hours in a single shift`)
        }

        prevEmployee = currentEmployee;
        prevEndTime = currentEndTime;
    }
});
