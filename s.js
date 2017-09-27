createCopyButtonEvent();
createLeftCopyButtonEvent();
createToggleQuotesButtonEvent();
createTrimSpecialCharactersEvent();
createToggleInBracketsButtonEvent();

tarea = document.getElementById('tarea');
tarea.addEventListener("paste", createModifiedStringDelayed);
tarea.addEventListener("keyup", function(e){
    if (e.keyCode == 13) {
        createModifiedStringDelayed();
    }
});

document.getElementById('result').addEventListener("paste", createColumnStringDelayed);


function createModifiedString(type){
    resultString = '';
    type = type || 'none';
    tareaValue = document.getElementById('tarea').value;
    resultDiv = document.getElementById('result');
    tareaArray = tareaValue.split('\n');
    document.getElementById('itemCount').innerHTML = "Count: " + tareaArray.length;   
    if(type == 'none'){
        type = getInputType(tareaArray[0]);
    }
    document.getElementById('type').value = type;
    if(inBrackets()) resultString = 'IN (\n';
    for(i = 0; i < tareaArray.length; i++){
        tareaArray[i] = tareaArray[i].trim();
        if(tareaArray[i] == '') continue;
        if(trimSpecialCharacters()){
            tareaArray[i] = tareaArray[i].replace(/^\W+/g,"");
            tareaArray[i] = tareaArray[i].replace(/\W+$/g,"");
        }
        if(type == 'digits'){
            resultString += (tareaArray[i] + ',');
        } else {
            resultString += ('\'' + tareaArray[i] + '\'' + ',');
        }
    }
    resultString = resultString.slice(0, -1);
    if(inBrackets()) resultString += '\n)';
    resultDiv.value = resultString;
}

function createModifiedStringDelayed(){
    setTimeout(function() {
        createModifiedString();
    }, 100);
}

function createColumnStringDelayed(){
    setTimeout(function() {
        createColumnString();
    }, 100);
}

function createColumnString(){
    columnString = '';
    tareaValue = document.getElementById('tarea');
    resultDiv = document.getElementById('result').value;
    if(resultDiv.indexOf(',') === -1) return false;
    resultDiv = resultDiv.trim();
    resultDiv = resultDiv.replace(/^IN.*\(/,"");
    resultDiv = resultDiv.replace(/\)$/,"");
    resultArray = resultDiv.split(',');
    document.getElementById('itemCount').innerHTML = "Count: " + resultArray.length;
    for(i = 0; i < resultArray.length; i++){
        resultArray[i] = resultArray[i].trim();
        resultArray[i] = resultArray[i].replace(/^\'/,"");
        resultArray[i] = resultArray[i].replace(/\'$/,"");
        columnString += (resultArray[i] + '\n');
    }
    columnString = columnString.replace(/\n$/,"");
    tareaValue.value = columnString;
}

function createToggleQuotesButtonEvent(){
    var togglebtn = document.querySelector('#togglebtn');
    togglebtn.addEventListener('click', function(event) {
        newType = document.getElementById('type').value == 'digits' ? 'string' : 'digits';
        createModifiedString(newType);
    });
}

function createTrimSpecialCharactersEvent(){
    var toggleCheckbox = document.querySelector('#trimSpecialCharacters');
    toggleCheckbox.addEventListener('click', function(event) {
        createModifiedString();
    });
}

function createToggleInBracketsButtonEvent(){
    var togglebtn = document.querySelector('#toggleInBracketsBtn');
    togglebtn.addEventListener('click', function(event) {
        var inBrackets = document.getElementById('inBrackets').value;
        document.getElementById('inBrackets').value = (inBrackets == 'yes') ? 'no' : 'yes';
        createModifiedString();
    });
}

function doCopy(textareaSelector,btnSelector){
    var copyTextareaBtn = document.querySelector(btnSelector);
    copyTextareaBtn.addEventListener('click', function(event) {
        var copyTextarea = document.querySelector(textareaSelector);
        copyTextarea.select();
        try {
            var successful = document.execCommand('copy');
            if(successful){
                copyTextareaBtn.innerHTML = 'Copied !';
                setTimeout(function(){
                    copyTextareaBtn.innerHTML = 'COPY';
                }, 2000);
            }
            console.log('Copying text command');
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    });
}

function createCopyButtonEvent(){
    doCopy('#result','#copybtn');
    
    // var copyTextareaBtn = document.querySelector('#copybtn');
    // copyTextareaBtn.addEventListener('click', function(event) {
      // var copyTextarea = document.querySelector('#result');
      // copyTextarea.select();
      // try {
        // var successful = document.execCommand('copy');
        // if(successful){
            // copyTextareaBtn.innerHTML = 'Copied !';
            // setTimeout(function(){
                // copyTextareaBtn.innerHTML = 'COPY';
            // }, 2000);
        // }
        // console.log('Copying text command');
      // } catch (err) {
        // console.log('Oops, unable to copy');
      // }
    // });
}

function createLeftCopyButtonEvent(){
    doCopy('#tarea','#leftcopybtn');
    
    // var copyTextareaBtn = document.querySelector('#leftcopybtn');
    // copyTextareaBtn.addEventListener('click', function(event) {
      // var copyTextarea = document.querySelector('#tarea');
      // copyTextarea.select();
      // try {
        // var successful = document.execCommand('copy');
        // if(successful){
            // copyTextareaBtn.innerHTML = 'Copied !';
            // setTimeout(function(){
                // copyTextareaBtn.innerHTML = 'COPY';
            // }, 2000);
        // }
        // console.log('Copying text command');
      // } catch (err) {
        // console.log('Oops, unable to copy');
      // }
    // });
}

function getInputType(input){
    return /^\d+$/.test(input) ? 'digits' : 'string';
}

function trimSpecialCharacters(){
    return document.getElementById("trimSpecialCharacters").checked;
}

function inBrackets(){
    return document.getElementById('inBrackets').value == 'yes' ? true : false;
}
