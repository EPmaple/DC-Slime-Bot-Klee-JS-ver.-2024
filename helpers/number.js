function isNumber(value) {
    /*
        If the parameter value is a valid number or can be converted to a valid
    number (including numeric strings), then it is converted to that number
        Else if value cannot be converted to a number, then NaN is returned
     */
    const num = Number(value);
    return !isNaN(num);
}

module.exports = {
    isNumber
}
