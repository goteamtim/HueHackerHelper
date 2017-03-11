var app = angular.module('hueHelper', []);

app.service('hueGlobals', function () {
    var lights,
        lightsSet,
        userObject = {};

    return {
        getLights: function () {
            return userObject.lightingInfo || lights;
        },
        setLights: function (value, lightsSetStatus) {
            lights = value;
            chrome.storage.local.set({ 'lightingInfo': value }, function () {/*Might need to get user lights here.*/ });
            lightsSet = lightsSetStatus;
        },
        lightsSetStatus: function(){return lightsSet;}
    };
});


app.controller('mainController', ['$scope', '$http', 'hueGlobals', function ($scope, $http, hueGlobals) {
    $scope.userObject = {
        localIpAddress: "",
        hueUsername: "",
        baseApiUrl: "",
        getInfoUrl: 'https://www.meethue.com/api/nupnp',
        lightingInfo: {}
    },
        $scope.hardwareStatus = document.getElementById('hardwareStatus'),
        $scope.spinner = document.getElementsByClassName('mdl-spinner mdl-js-spinner is-active')[0],
        $scope.counter = 0,
        $scope.setupButton = document.getElementById('setupButton');

    $scope.init = function () {
        //check for cookie
        chrome.storage.local.get(function (storedUserObject) {
            if ($.isEmptyObject(storedUserObject)) {
                setupButton.disabled = false;
                $.get(userObject.getInfoUrl, function (result) {
                    document.getElementsByClassName('mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect')[0].addEventListener('click', setupButtonPressed);
                    if (result.length == 0) {
                        hardwareStatus.innerHTML = "I can't seem to find a bridge.  Please enter the IP address below to setup.";
                        document.getElementById('ipAddressForm').hidden = false;
                    } else {
                        userObject.localIpAddress = result[0].internalipaddress;
                        document.getElementById('bridgeIP').innerHTML = userObject.localIpAddress;
                    }
                })
            } else {
                //Use the userobject to update the UI
                document.getElementById('bridgeIP').innerHTML = storedUserObject.localIpAddress;
                hardwareStatus.innerHTML = "Your API Key:<br><input id=\"hueUsername\"value=\"" + storedUserObject.hueUsername + "\"></input>";
                document.getElementById('hueUsername').addEventListener('click', $scope.copy);
                setupButton.classList = "disabled";
                hueGlobals.userObject = storedUserObject;
                $scope.getLights(storedUserObject);
            }
        });

    };

    $scope.setupNewUser = function (ipAddress) {
        spinner.hidden = false;
        var localUrl = 'http://' + userObject.localIpAddress + '/api';
        $.post(localUrl, '{"devicetype":"chrome_extension#HueHackerHelper"}', function (response, status) {
            if (response[0].hasOwnProperty("success")) {
                //They pressed the button
                userObject.hueUsername = response[0].success.username;
                userObject.baseApiUrl = 'http://' + userObject.localIpAddress + '/api/' + userObject.hueUsername;
                hardwareStatus.innerHTML = "Your API Key:<br><input id=\"hueUsername\" >" + response[0].success.username + "</input>";
                spinner.hidden = true;
                chrome.storage.local.set(userObject);
                console.log(document.getElementById('hueUsername').text);
                document.getElementById('hueUsername').addEventListener('click', $scope.copy);
            } else if (response[0].hasOwnProperty("error")) {
                if (counter <= 8) {
                    setTimeout(function () { setupNewUser(userObject.localIpAddress); }, 2000);
                    counter++;
                } else {
                    counter = 0;
                    spinner.hidden = true;
                    //Add button to popup that offers to run it again
                    hardwareStatus.innerHTML = "Hmm, something isn't right, here is the response from" +
                        "your Hue base:\n" + response[0].error.description;
                }
            }
        })

            .fail(function (status) {
                document.getElementById('ipAddressForm').hidden = true;
                spinner.hidden = true;
                //status.status number ex.  404
                //status.statusText = reason
                hardwareStatus.innerHTML = "I can't seem to connect to your hue.  Please check the connection and make sure you" +
                    " are on the same network then try again.";
                console.log("Status: " + status.status)
            });

    };

    $scope.handleSetupResponse = function (response) {
        if (response.hasOwnProperty("success")) {
            return response;
        }
    };

    $scope.getLights = function (userInfo) {
        $.ajax({
            url: userInfo.baseApiUrl + "/lights",
            timeout:300, 
            })
        .done(function (response) {
            
            hueGlobals.setLights(response,true);
        })
        .error(function(err){
            //Timeout can be handled here
            hueGlobals.setLights(response,"unknown");
            console.log(err);
        });
    }

    $scope.setupButtonPressed = function () {
        if (document.getElementById('ipInput').value != "") {
            console.log("form input: " + document.getElementById('ipInput').value);
            //I cant find their IP, use the one they input
            userObject.localIpAddress = document.getElementById('ipInput').value;
            setupNewUser(userObject.localIpAddress);
        } else {
            setupNewUser(userObject.localIpAddress);
        }
    };

    $scope.copy = function () {

        var hueUser = document.getElementById("hueUsername");
        var input = document.createElement('input');
        input.value = hueUser.text;
        hueUser.select();
        hueUser.focus();
        document.execCommand("Copy", false, null);
        clearSelection();

    };

    $scope.clearSelection = function () {
        if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }

    $scope.init();
}]);


app.controller('lightsController', ['$scope', '$http', 'hueGlobals', function ($scope, $http, hueGlobals) {
    $scope.lights;
    $scope.lightsLoading = true;

    $scope.getLights = function () {
        if (hueGlobals.lightsSetStatus() == undefined) {
            setTimeout(function () {
                $scope.getLights();
            }, 1000);
        } else {
            console.log(hueGlobals.lightsSetStatus())
            if(hueGlobals.lightsSetStatus() == true){
            $scope.lights = hueGlobals.getLights();
            $scope.lightsLoading = false;
            $scope.$apply();
            }else if(hueGlobals.lightsSetStatus() == "unknown"){
                //Probably cant reach the hue base.  Let user know here
                $scope.lightsLoading = false;
            }
            
        }
    }

    $scope.setLightState = function (deviceId, light) {
        let apiCall = "http://" + hueGlobals.userObject.localIpAddress;
        apiCall += "/api/" + hueGlobals.userObject.hueUsername + "/lights/" + deviceId + "/state"; //Might need /api/ here, check the baseApiUrl
        $http.put(apiCall, { "on": !light.state.on }).then(function (response) {
            //Let the user know the state change...or dont...
            console.log(response)
            if (response.data[0].success) {
                light.state.on = response.data[0].success[Object.keys(response.data[0].success)[0]];
                //Thing worked, swap teh class and change the function call to be opposite
            } else {
                //Something went wrong, alert user with the status response?
            }
        });


    }


    $scope.getLights();
}]);


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-85118519-1']);
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

