
const arrayObj = Array();

const sum = (a,b) => {
    return a + b;
}

function addTrade(trade) {
    arrayObj.push(trade);
}

exports.sum = sum;
exports.arrayObj = arrayObj;
exports.addTrade = addTrade;