var cardsInfo = [];

for(var i = 0; i < 52; i++){
    cardsInfo.push({
        num: i % 13 + 1,
        suit: i % 4
    });
}

function infoToCardId(num, suit){
    var r = num - 1;
    while(r % 4 !== suit){
        r += 13;
    }
    return r;
}

function removeFromUnorderedArray(arr, item){
    // console.trace();
    if(!arr.length) return;
    var ind = arr.indexOf(item);
    if(ind === -1) return;
    arr[ind] = arr[arr.length - 1];
    arr.pop();
}
