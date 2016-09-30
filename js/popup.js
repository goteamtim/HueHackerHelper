/*
check cookie
    if there then show current api key and status
    otherwise
    check the status, if its button is pressed show the key and lights and store the cookie
*/

var userObject = {
    localIpAddress: "",
    hueUsername: "",
    baseApiUrl: "",
    getInfoUrl: 'https://www.meethue.com/api/nupnp'
};

function init() {
    //check for cookie
    chrome.storage.local.get(function (userObject) {
        console.log(userObject);
        console.log(typeof(userObject))
        if ($.isEmptyObject(userObject)) {
            $.get(userObject.getInfoUrl, function (result) {
                //Check for not being able to connect here
                userObject.localIpAddress = result[0].internalipaddress;
                setupNewUser(userObject.localIpAddress);
            })
        }else{
            //Use the userobject to update the UI
            document.getElementById('hardwareStatus').innerHTML = "Your API Key: " + userObject.hueUsername;
        }
    })

}

function setupNewUser(ipAddress) {
    var localUrl = 'http://' + userObject.localIpAddress + '/api';
    $.post(localUrl, '{"devicetype":"chrome_extension#HueHackerHelper"}', function (response) {
        console.log(response)
        if (response[0].hasOwnProperty("success")) {
            //They pressed the button
            userObject.hueUsername = response[0].success.username;
            userObject.baseApiUrl = 'http://' + userObject.localIpAddress + '/api/' + userObject.hueUsername;
            alert('Congratulations!  You now have an API key!\n' + userObject.hueUsername)
            chrome.storage.local.set(userObject);
        } else if (response[0].hasOwnProperty("error")) {
            //Add button to popup that offers to run it again
        }
    });
    
}

function handleSetupResponse(response) {
    if (response.hasOwnProperty("success")) {
        return response;
    }
}

function getLights() {
    $.get(userObject.baseApiUrl, function (response) {
        console.log(response);
    })
}

init();