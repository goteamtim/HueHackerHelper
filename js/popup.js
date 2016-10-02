var userObject = {
    localIpAddress: "",
    hueUsername: "",
    baseApiUrl: "",
    getInfoUrl: 'https://www.meethue.com/api/nupnp',
    lightingInfo: {}
},
hardwareStatus = document.getElementById('hardwareStatus'),
spinner = document.getElementsByClassName('mdl-spinner mdl-js-spinner is-active')[0];

function init() {
    //check for cookie
    chrome.storage.local.get(function (storedUserObject) {
        if ($.isEmptyObject(storedUserObject)) {
            $.get(userObject.getInfoUrl, function (result) {
                //Check for empty array, if its empto then prompt the user for an ip address
                //Check for not being able to connect here
                document.getElementsByClassName('mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect')[0].addEventListener('click',setupButtonPressed)
                if(result.length == 0){
                      hardwareStatus.innerHTML = "I can't seem to find a bridge.  Please enter the IP address below to setup.";
                      document.getElementById('ipAddressForm').hidden = false;
                }else{
                    userObject.localIpAddress = result[0].internalipaddress;
                document.getElementById('bridgeIP').innerHTML = userObject.localIpAddress;
                }
            })
        }else{
            //Use the userobject to update the UI
            hardwareStatus.innerHTML = "Your API Key:\n" + storedUserObject.hueUsername;
            getLights(storedUserObject);
        }
    })

}

function setupNewUser(ipAddress) {
    var couner = 0;
    spinner.hidden = false;
    var localUrl = 'http://' + userObject.localIpAddress + '/api';
    $.post(localUrl, '{"devicetype":"chrome_extension#HueHackerHelper"}', function (response,status) {
        if (response[0].hasOwnProperty("success")) {
            //They pressed the button
            userObject.hueUsername = response[0].success.username;
            userObject.baseApiUrl = 'http://' + userObject.localIpAddress + '/api/' + userObject.hueUsername;
            hardwareStatus.innerHTML = "Your API Key: ";
            document.getElementById('statusFromBase').text = userObject.hueUsername;
            document.getElementById('statusFromBase').id = 'successfulKey';
            chrome.storage.local.set(userObject);
        } else if (response[0].hasOwnProperty("error")) {
            if(counter <=8){
                setTimeout(setupNewUser(userObject.localIpAddress),2000);
                counter++;
            }else{
                spinner.hidden = true;
            //Add button to popup that offers to run it again
            hardwareStatus.innerHTML = "Hmm, something isn't right, here is the response from" + 
            "your Hue base: " + response[0].error.description;
            //document.getElementById('statusFromBase').innerHTML = response[0].error.description;
            }
        }
    })
    
    .fail(function(status){
        document.getElementById('ipAddressForm').hidden = true;
        spinner.hidden = true;
        //status.status number ex.  404
        //status.statusText = reason
        hardwareStatus.innerHTML = "I can't seem to connect to your hue.  Please check the connection and make sure you"+
        " are on the same network then try again.";
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

function setupButtonPressed(){
    if(document.getElementById('ipInput').value != null){
        //I cant find their IP, use the one they input
        userObject.localIpAddress = document.getElementById('ipInput').value;
        setupNewUser(userObject.localIpAddress);
    }else{
        setupNewUser(userObject.localIpAddress);
    }
}

init();