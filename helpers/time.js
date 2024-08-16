
function getCurrentDateAndDate() {
    const date = new Date();
    // console.log(date); // e.g., Sat May 18 2024 12:34:56 GMT+0000 (UTC)
    const isoString = date.toISOString(); // e.g., "2024-05-18T12:34:56.789Z"
    return isoString; // e.g., "2024-05-18T12:34:56.789Z"
    // return currentDate = isoString.slice(0, 10); // "2024-05-18"
}

/**
 * Example of a zoom object:
 * { _id: "new ObjectId()", time: "2024-05-18T12:00:00Z" }
 */

function getNumOfZoomsInPastSevenDays(zoomsArray) {
    // Get the current date and time
    const now = new Date(); // Sat Jul 22 2023 14:45:26 GMT+0000 (Coordinated Universal Time)

    /*
    .getDate() returns the day fo the month (1-31) for the specified date,
    -7 to subtract seven days from the current day of the month, and .setDate()
    will handle the overflow correctly (e.g., going from 2nd of a month back
    to the 26th of the previous month)
     */
    // Calculate the date and time seven days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Filter the zoomsArray to include only zoom objects within the past seven days
    const zoomsInPastSevenDays = zoomsArray.filter(zoom => {
        // Date() can parse ISOString no problem
        const zoomDate = new Date(zoom.time);
        return zoomDate >= sevenDaysAgo && zoomDate <= now;
    });

    // Return the count of the filtered array
    return zoomsInPastSevenDays.length;
}

function getUTCDayName() {
    const date = new Date();

    // Array of weekday names
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Get the day of the week in UTC (0-6), 0 representing Sunday
    const utcDayIndex = date.getUTCDay();

    // Return the name of the day
    return weekdays[utcDayIndex];
}


module.exports = {
    getUTCDayName, getCurrentDateAndDate, getNumOfZoomsInPastSevenDays
}

