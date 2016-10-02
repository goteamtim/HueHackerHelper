/*
    if there then show current api key and status
    otherwise
    check the status, if its button is pressed show the key and lights and store the cookie
*/

var userObject = {
    localIpAddress: "",
    hueUsername: "",
    baseApiUrl: "",
    getInfoUrl: 'https://www.meethue.com/api/nupnp',
    lightingInfo: {}
};

function init() {
    //check for cookie
    chrome.storage.local.get(function (storedUserObject) {
        if ($.isEmptyObject(storedUserObject)) {
            $.get(userObject.getInfoUrl, function (result) {
                //Check for not being able to connect here
                userObject.localIpAddress = result[0].internalipaddress;
                setupNewUser(userObject.localIpAddress);
            })
        }else{
            //Use the userobject to update the UI
            document.getElementById('hardwareStatus').innerHTML = "Your API Key:\n" + storedUserObject.hueUsername;
            getLights(storedUserObject);
        }
    })

}

function setupNewUser(ipAddress) {
    var localUrl = 'http://' + userObject.localIpAddress + '/api';
    $.post(localUrl, '{"devicetype":"chrome_extension#HueHackerHelper"}', function (response) {
        if (response[0].hasOwnProperty("success")) {
            //They pressed the button
            userObject.hueUsername = response[0].success.username;
            userObject.baseApiUrl = 'http://' + userObject.localIpAddress + '/api/' + userObject.hueUsername;
            document.getElementById('hardwareStatus').innerHTML = "Your API Key: ";
            document.getElementById('statusFromBase').text = userObject.hueUsername;
            document.getElementById('statusFromBase').id = 'successfulKey';
            chrome.storage.local.set(userObject);
        } else if (response[0].hasOwnProperty("error")) {
            //Add button to popup that offers to run it again
            document.getElementById('hardwareStatus').innerHTML = "Hmm, something isn't right, here is the response from" + 
            "your Hue base: ";
            document.getElementById('statusFromBase').innerHTML = response[0].error.description;
        }
    });
    
}

function handleSetupResponse(response) {
    if (response.hasOwnProperty("success")) {
        return response;
    }
}

function getLights(userInfo) {
    $.get(userInfo.baseApiUrl + "/lights", function (response) {
        console.log(response);
    })
}

function clearStorage(){
    chrome.storage.local.clear();
}

init();